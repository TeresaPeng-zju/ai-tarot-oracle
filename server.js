// 后端代理服务器 - 用于保护 DeepSeek API Key
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体

// DeepSeek API 代理端点
app.post('/api/tarot-reading', async (req, res) => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ 
            error: 'API Key 未配置，请在 .env 文件中设置 DEEPSEEK_API_KEY' 
        });
    }

    try {
        const { question, cards, model = 'deepseek-reasoner' } = req.body;

        // 构建塔罗牌描述（按照用户要求的格式）
        const cardsStr = cards.map((c, index) => {
            const cardName = c.isReversed ? `${c.name}（逆位）` : c.name;
            return cardName;
        }).join('、');

        // 构建 prompt（使用更清晰、更符合塔罗师身份的格式）
        const systemPrompt = `
        你不是在解释塔罗牌义，
        你正在为一个真实的人进行占卜。

        你的身份是一位经验丰富、直觉极强的塔罗师：
        - 你相信牌不是随机的，而是回应提问者的潜意识
        - 你会优先说出“最重要、最刺痛、最被回避的那一点”
        - 你允许使用直觉判断，而不是完全依赖教科书牌义

        占卜风格要求：
        - 语言要有温度，像在低声对话，而不是写报告
        - 不要按“每张牌分别解释”的教科书结构
        - 可以在解读中停顿、反问、直指情绪
        - 允许模糊性、象征性和心理暗示
        - 少总结，多揭示

        你的目标不是安慰人，
        而是帮助提问者看清正在发生的事。
        `;

        
        const userPrompt = `
        我现在的问题是：「${question}」。

        在开始解读前，请你先静默片刻，
        像真正的塔罗师一样感受这组牌的整体气息。

        我抽到的三张牌（按时间顺序展开）是：
        ${cardsStr}

        请像真正的塔罗师一样，先静静感受这组牌的整体气息。
        根据牌阵的气质和洗牌时的命运能量，请自动选择适合的解读风格（温柔/冷静/残酷），
        让解读既有灵魂，又能直击我的内心。

        不要机械列出牌义，而是：
        - 从直觉出发讲述牌的故事
        - 用比喻、意象和情绪去表达
        - 让每张牌都有它独特的声音

        请开始你的详细解读。
        `;

        // 转发请求到 DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
        }

        const data = await response.json();
        
        // 清理返回内容中的 markdown 符号
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            let content = data.choices[0].message.content;
            
            // 去掉 markdown 符号
            content = content
                .replace(/^#{1,6}\s+/gm, '') // 去掉标题符号 (# ## ### 等)
                .replace(/\*\*([^*]+)\*\*/g, '$1') // 去掉粗体符号 (**文本** -> 文本)
                .replace(/\*([^*]+)\*/g, '$1') // 去掉斜体符号 (*文本* -> 文本)
                .replace(/^\s*-\s+/gm, '• ') // 将 - 列表符号改为更美观的 • 符号
                .replace(/^\s*\d+\.\s+/gm, (match) => match.trim() + ' ') // 保留有序列表数字，但去掉多余空格
                .trim();
            
            data.choices[0].message.content = content;
        }
        
        res.json(data);
    } catch (error) {
        console.error('DeepSeek API 错误:', error);
        res.status(500).json({ 
            error: error.message || '服务器内部错误' 
        });
    }
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`🚀 后端代理服务器运行在 http://localhost:${PORT}`);
    console.log(`📝 API 端点: http://localhost:${PORT}/api/tarot-reading`);
});