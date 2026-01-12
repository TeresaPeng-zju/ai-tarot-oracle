// Three.js 类型声明（从 CDN 加载）
declare const THREE: any;

// TWEEN.js 类型声明（从 CDN 加载）
declare namespace TWEEN {
  interface Tween<T> {
    to(properties: Partial<T>, duration: number): Tween<T>;
    easing(easing: any): Tween<T>;
    start(): Tween<T>;
  }
  
  namespace Easing {
    namespace Cubic {
      function Out(t: number): number;
    }
    namespace Back {
      function Out(t: number): number;
    }
  }
  
  function update(time?: number): void;
}

// MediaPipe 类型声明（全局变量）
declare var Camera: {
  new (video: HTMLVideoElement, options: { onFrame: () => Promise<void>; width: number; height: number }): CameraInstance;
};

declare var Hands: {
  new (options: { locateFile: (file: string) => string }): HandsInstance;
};

interface CameraInstance {
  start(): Promise<void>;
}

interface HandsInstance {
  setOptions(options: {
    maxNumHands: number;
    modelComplexity: number;
    minDetectionConfidence: number;
    minTrackingConfidence: number;
  }): void;
  onResults(callback: (results: MediaPipeHandsResults) => void): void;
  send(options: { image: HTMLVideoElement }): Promise<void>;
}

interface MediaPipeHandsResults {
  multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
}

// 塔罗卡牌数据类型
export interface TarotCard {
  n: string; // 中文名
  e: string; // 英文名
  m: string; // 描述
  url: string; // 图片 URL
  type: string; // 类型
}

export interface MinorSuit {
  id: string;
  name: string;
  key: string;
  alt?: string;
}

export interface MinorRank {
  id: string;
  cn: string;
  m: string;
}

