import './styles.less';
import { CONFIG } from './config';
import { TAROT_DB, getImg } from './data';
import { ashVertexShader, ashFragmentShader } from './shaders';

type GestureMode = 'none' | 'open' | 'point' | 'pinch' | 'fist';
type AppState = 'browsing' | 'focusing' | 'revealed' | 'burning';

interface Particle {
  mesh: THREE.Points;
  age: number;
}

class TarotSpace {
  private container: HTMLElement;
  private w: number;
  private h: number;
  
  private cards: THREE.Group[] = [];
  private particles: Particle[] = [];
  private state: AppState = 'browsing';
  private gestureMode: GestureMode = 'none';
  private scrollOffset = 0;
  private targetScrollOffset = 0;
  private hoveredCard: THREE.Group | null = null;
  private revealedCard: THREE.Group | null = null;

  private handPos = { x: 0, y: 0 };
  private cursorPos = new THREE.Vector2(0, 0);
  private targetCursorPos = new THREE.Vector2(0, 0);
  
  private texLoader: THREE.TextureLoader;
  private backTexture!: THREE.Texture;
  
  // Three.js 对象
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cursorMesh!: THREE.Mesh;
  private raycaster!: THREE.Raycaster;
  private bgStars!: THREE.Points;
  private hands!: any;
  private cameraInstance!: any;
  private useGestureControl = false;

  constructor() {
    this.container = document.getElementById('canvas-container')!;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    
    this.texLoader = new THREE.TextureLoader();
    this.texLoader.setCrossOrigin('anonymous');
    
    this.initThree();
    this.initBackTexture();
    this.initCards();
    this.initCursor();
    this.initBackgroundStars();
    this.initMediaPipe();
    this.initMouse();

    console.log("场景初始化完成:");
    console.log("- 卡牌数量:", this.cards.length);
    console.log("- 背面纹理:", this.backTexture ? "已设置" : "未设置");
    console.log("- 相机位置:", this.camera.position);
    console.log("- 场景对象数:", this.scene.children.length);

    this.animate();
  }

  private initBackTexture(): void {
    this.backTexture = this.createProceduralBack();
    console.log("✅ 默认背面纹理已创建");
    
    const protocol = window.location.protocol;
    console.log("当前协议:", protocol);
    if (protocol === 'file:') {
      console.warn("⚠️ 检测到 file:// 协议，图片可能无法加载！");
    }
    
    this.texLoader.load(
      'tarot-card-back.jpg',
      (tex: THREE.Texture) => {
        console.log("✅ tarot-card-back.jpg 加载成功！");
        tex.encoding = THREE.sRGBEncoding;
        this.backTexture = tex;
        this.updateCardBacks(tex);
      },
      undefined,
      (err: Error) => {
        console.warn("⚠️ 未找到 tarot-card-back.jpg，使用默认背面。");
        console.log("错误详情:", err);
        if (this.cards.length > 0) {
          this.updateCardBacks(this.backTexture);
        }
      }
    );
  }

  private updateCardBacks(tex: THREE.Texture): void {
    if (!tex) return;
    this.cards.forEach(group => {
      const backMesh = group.children[0] as THREE.Mesh;
      if (backMesh && backMesh.material) {
        (backMesh.material as THREE.MeshBasicMaterial).map = tex;
        if (tex.encoding) {
          tex.encoding = tex.encoding;
        }
        backMesh.material.needsUpdate = true;
      }
    });
  }

  private createProceduralBack(): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 800;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 512, 800);
    ctx.strokeStyle = '#a67c00';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 472, 760);
    ctx.translate(256, 400);
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.stroke();
    return new THREE.CanvasTexture(c);
  }

  private createFrontTexture(data: { e: string; n: string }): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 800;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#f5f0e1';
    ctx.fillRect(0, 0, 512, 800);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, 472, 760);
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.font = 'bold 50px serif';
    ctx.fillText(data.e, 256, 300);
    ctx.font = '30px sans-serif';
    ctx.fillStyle = '#555';
    ctx.fillText(data.n, 256, 360);
    return new THREE.CanvasTexture(c);
  }

  private initThree(): void {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.02);

    this.camera = new THREE.PerspectiveCamera(60, this.w / this.h, 0.1, 100);
    this.camera.position.set(0, 0, CONFIG.cameraZ);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.w, this.h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 10);
    this.scene.add(dirLight);
  }

  private initBackgroundStars(): void {
    const count = 1000;
    const geo = new THREE.BufferGeometry();
    const pos: number[] = [];
    for (let i = 0; i < count; i++) {
      pos.push(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 50 - 20
      );
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x888888,
      size: 2,
      sizeAttenuation: false
    });
    this.bgStars = new THREE.Points(geo, mat);
    this.scene.add(this.bgStars);
  }

  private initCards(): void {
    const geo = new THREE.PlaneGeometry(1.6, 2.6);
    const count = TAROT_DB.length;

    console.log(`开始创建 ${count} 张卡牌，使用纹理:`, this.backTexture ? '已设置' : '未设置');

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();
      
      const backMat = new THREE.MeshBasicMaterial({
        map: this.backTexture,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1.0
      });
      const back = new THREE.Mesh(geo, backMat);
      
      const frontMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.DoubleSide
      });
      const front = new THREE.Mesh(geo, frontMat);
      front.position.z = -0.01;

      group.add(back);
      group.add(front);
      
      group.userData = {
        id: i,
        info: TAROT_DB[i],
        baseX: (i - count / 2) * CONFIG.spreadWidth
      };
      group.position.set((i - count / 2) * CONFIG.spreadWidth, 0, 0);
      this.scene.add(group);
      this.cards.push(group);
    }
    
    console.log(`✅ 已创建 ${this.cards.length} 张卡牌`);
  }

  private initCursor(): void {
    const geo = new THREE.RingGeometry(0.12, 0.15, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    this.cursorMesh = new THREE.Mesh(geo, mat);
    this.cursorMesh.visible = false;
    this.scene.add(this.cursorMesh);
    this.raycaster = new THREE.Raycaster();
  }

  private updateLayout(): void {
    if (this.state === 'revealed' || this.state === 'burning') return;
    
    this.scrollOffset += (this.targetScrollOffset - this.scrollOffset) * 0.1;

    this.cards.forEach((card) => {
      const worldX = card.userData.baseX + this.scrollOffset;
      const dist = Math.abs(worldX);
      
      card.visible = true;
      card.position.x = worldX;
      card.position.y = 0;
      const zDepth = -Math.pow(dist * 0.35, 1.2);
      card.position.z = Math.max(-6, Math.min(0, zDepth));
      card.rotation.y = Math.max(-0.6, Math.min(0.6, -worldX * 0.1));
      card.rotation.x = 0;
      card.rotation.z = 0;

      if (this.state === 'focusing' && this.hoveredCard === card) {
        card.scale.setScalar(1.15);
        card.position.z += 1.5;
        card.rotation.y = 0;
      } else {
        card.scale.setScalar(1.0);
      }
    });
  }

  private handleGestures(): void {
    if (this.state === 'burning') return;

    document.querySelectorAll('.status-icon').forEach(el => el.classList.remove('active'));
    if (this.gestureMode !== 'none') {
      const el = document.getElementById('icon-' + this.gestureMode);
      if (el) el.classList.add('active');
    }

    if (this.state === 'browsing' || this.state === 'focusing') {
      if (this.gestureMode === 'open') {
        const speed = CONFIG.scrollSpeed;
        if (this.handPos.x < -0.15) {
          this.targetScrollOffset += speed * (Math.abs(this.handPos.x) * 3);
        } else if (this.handPos.x > 0.15) {
          this.targetScrollOffset -= speed * (Math.abs(this.handPos.x) * 3);
        }
        
        const limit = (TAROT_DB.length / 2) * CONFIG.spreadWidth + 2;
        this.targetScrollOffset = Math.max(-limit, Math.min(limit, this.targetScrollOffset));
        
        this.state = 'browsing';
        this.cursorMesh.visible = false;
        this.hoveredCard = null;
      } else if (this.gestureMode === 'point' || this.gestureMode === 'pinch') {
        this.state = 'focusing';
        this.cursorMesh.visible = true;
        this.cursorPos.lerp(this.targetCursorPos, CONFIG.cursorSmooth);

        const vec = new THREE.Vector3(this.cursorPos.x, this.cursorPos.y, 0.5);
        vec.unproject(this.camera);
        const dir = vec.sub(this.camera.position).normalize();
        const pos = this.camera.position.clone().add(dir.multiplyScalar(-this.camera.position.z / dir.z));
        this.cursorMesh.position.copy(pos);

        this.raycaster.setFromCamera(this.cursorPos, this.camera);
        const intersects = this.raycaster.intersectObjects(this.cards, true);
        
        if (intersects.length > 0) {
          let target: THREE.Object3D = intersects[0].object;
          while (target.parent && !target.userData.id) target = target.parent;
          this.hoveredCard = target as THREE.Group;
        } else {
          this.hoveredCard = null;
        }

        if (this.gestureMode === 'pinch' && this.hoveredCard) {
          this.revealCard(this.hoveredCard);
        }
      }
    } else if (this.state === 'revealed') {
      if (this.gestureMode === 'fist') {
        this.burnCard();
      }
    }
  }

  private revealCard(cardGroup: THREE.Group): void {
    if (this.state === 'revealed') return;
    this.state = 'revealed';
    this.revealedCard = cardGroup;
    this.cursorMesh.visible = false;
    
    document.getElementById('icon-fist')!.style.display = 'flex';
    document.getElementById('burn-hint')!.style.display = 'block';

    const data = cardGroup.userData.info;
    const backMesh = cardGroup.children[0] as THREE.Mesh;
    const frontMesh = cardGroup.children[1] as THREE.Mesh;
    
    // 隐藏背面，显示正面
    backMesh.visible = false;
    frontMesh.position.z = 0.01; // 将正面移到前面
    
    this.texLoader.load(
      getImg(data.url),
      (tex: THREE.Texture) => {
        tex.encoding = THREE.sRGBEncoding;
        (frontMesh.material as THREE.MeshBasicMaterial).map = tex;
        frontMesh.material.needsUpdate = true;
      },
      undefined,
      () => {
        (frontMesh.material as THREE.MeshBasicMaterial).map = this.createFrontTexture(data);
        frontMesh.material.needsUpdate = true;
      }
    );

    new TWEEN.Tween(cardGroup.position)
      .to({ x: 0, y: 0, z: CONFIG.cameraZ - 3 }, 1000)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();

    new TWEEN.Tween(cardGroup.rotation)
      .to({ x: 0, y: 0, z: 0 }, 1000)
      .easing(TWEEN.Easing.Back.Out)
      .start();

    this.cards.forEach(c => {
      if (c !== cardGroup) {
        new TWEEN.Tween(c.position).to({ z: -50 }, 800).start();
      }
    });

    setTimeout(() => {
      document.getElementById('card-name')!.innerText = data.n;
      document.getElementById('card-sub')!.innerText = data.type;
      document.getElementById('card-desc')!.innerText = data.m;
      document.getElementById('card-detail')!.style.opacity = '1';
    }, 800);
  }

  private burnCard(): void {
    if (!this.revealedCard || this.state === 'burning') return;
    this.state = 'burning';
    
    this.createAshEffect(this.revealedCard.position);

    this.revealedCard.visible = false;
    this.scene.remove(this.revealedCard);
    
    const idx = this.cards.indexOf(this.revealedCard);
    if (idx > -1) this.cards.splice(idx, 1);
    this.revealedCard = null;

    document.getElementById('card-detail')!.style.opacity = '0';
    document.getElementById('burn-hint')!.style.display = 'none';
    document.getElementById('icon-fist')!.style.display = 'none';
    document.getElementById('deck-count')!.innerText = "CARDS: " + this.cards.length;

    setTimeout(() => {
      this.state = 'browsing';
    }, 2000);
  }

  private createAshEffect(pos: THREE.Vector3): void {
    const count = 5000;
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const randoms: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * 1.6,
        (Math.random() - 0.5) * 2.6,
        0
      );
      randoms.push(Math.random());
      if (Math.random() > 0.5) color.setHex(0xd4af37);
      else color.setHex(0xaaaaaa);
      colors.push(color.r, color.g, color.b);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('aRandom', new THREE.Float32BufferAttribute(randoms, 1));
    geo.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
      vertexShader: ashVertexShader,
      fragmentShader: ashFragmentShader,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    const points = new THREE.Points(geo, material);
    points.position.copy(pos);
    this.scene.add(points);
    this.particles.push({ mesh: points, age: 0 });
  }

  private initMediaPipe(): void {
    const vid = document.getElementById('input-video') as HTMLVideoElement;
    this.hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    // 使用箭头函数绑定 this，确保回调中的 this 指向正确的实例
    let callCount = 0;
    const onResultsHandler = (results: any) => {
      callCount++;
      if (callCount % 30 === 0) { // 每30帧打印一次，避免日志过多
        console.log(`📹 MediaPipe onResults 被调用 (${callCount}次)`, 
          results.multiHandLandmarks ? `检测到${results.multiHandLandmarks.length}只手` : '未检测到手');
      }
      // 一旦摄像头启动，就使用手势控制（即使暂时检测不到手）
      this.useGestureControl = true;
      
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const lm = results.multiHandLandmarks[0];
        const idx = lm[8];
        const thb = lm[4];
        const wrs = lm[0];
        const mid = lm[12];
        const rng = lm[16];
        const pnk = lm[20];

        this.handPos.x = (1 - lm[9].x) * 2 - 1;
        this.targetCursorPos.x = (1 - idx.x) * 2 - 1;
        this.targetCursorPos.y = -(idx.y * 2 - 1);

        const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
          Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        const pinchDist = dist(idx, thb);
        
        const isFist =
          dist(mid, wrs) < 0.25 &&
          dist(rng, wrs) < 0.25 &&
          dist(pnk, wrs) < 0.25 &&
          dist(idx, wrs) < 0.25;
        const isPinch = pinchDist < 0.05;
        
        if (isFist) this.gestureMode = 'fist';
        else if (isPinch) this.gestureMode = 'pinch';
        else if (dist(idx, wrs) > 0.35) this.gestureMode = 'point';
        else this.gestureMode = 'open';
      } else {
        // 没有检测到手时，重置为 none
        this.gestureMode = 'none';
      }
    };
    
    this.hands.onResults(onResultsHandler);

    this.cameraInstance = new Camera(vid, {
      onFrame: async () => {
        await this.hands.send({ image: vid });
      },
      width: 320,
      height: 240
    });
    this.cameraInstance.start()
      .then(() => {
        console.log("✅ MediaPipe 摄像头启动成功");
        // 摄像头启动后，启用手势控制
        this.useGestureControl = true;
        console.log("✅ 手势控制已启用，useGestureControl =", this.useGestureControl);
        document.getElementById('loading')!.style.display = 'none';
        vid.classList.add('active');
      })
      .catch((err: Error) => {
        console.warn("⚠️ 摄像头启动失败，将使用鼠标控制:", err);
        const loadingEl = document.getElementById('loading')!;
        loadingEl.innerHTML =
          '🔮 命运之轮已启动（鼠标模式）<br>' +
          '<span style="font-size:12px; color:#aaa; display:block; margin-top:15px;">' +
          '摄像头未启用，可使用鼠标操作<br>' +
          '移动鼠标浏览 · 点击抽取 · 右键销毁</span>';
        setTimeout(() => {
          loadingEl.style.display = 'none';
        }, 2000);
      });
  }

  private initMouse(): void {
    window.addEventListener('mousemove', e => {
      // 如果使用手势控制，忽略鼠标事件
      if (this.useGestureControl) return;
      
      const x = (e.clientX / this.w) * 2 - 1;
      const y = -(e.clientY / this.h) * 2 + 1;
      this.handPos.x = x;
      this.targetCursorPos.set(x, y);
      if (Math.abs(x) > 0.6) this.gestureMode = 'open';
      else this.gestureMode = 'point';
    });
    window.addEventListener('mousedown', (e) => {
      // 如果使用手势控制，忽略鼠标事件
      if (this.useGestureControl) return;
      
      if (e.button === 2) this.gestureMode = 'fist';
      else if (this.gestureMode === 'point') this.gestureMode = 'pinch';
    });
    window.addEventListener('mouseup', () => {
      // 如果使用手势控制，忽略鼠标事件
      if (this.useGestureControl) return;
      
      this.gestureMode = 'point';
    });
    window.addEventListener('contextmenu', e => e.preventDefault());
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    TWEEN.update();
    this.updateLayout();
    this.handleGestures();
    
    if (this.bgStars) this.bgStars.rotation.y += 0.0002;
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += 0.02;
      (p.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = p.age;
      if (p.age > 2.5) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}

window.onload = () => new TarotSpace();

