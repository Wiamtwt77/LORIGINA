export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.opkey;

    if (!apiKey) {
        return res.status(200).json({ reply: '⚠️ تنبيه: مفتاح opkey غير موجود في إعدادات Environment Variables في Vercel.' });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://lorigina.vercel.app", 
                "X-Title": "Lorigina Store"
            },
            body: JSON.stringify({
                model: "google/gemini-flash-1.5", // المعرّف المعتمد رسمياً في OpenRouter
                messages: [
                    { 
                        role: "system", 
                        content: "أنت 'مستشار'، المساعد الذكي والمستشار الإبداعي لمتجر 'Lorigina' المتخصص في بيع المواد الأولية للحرف اليدوية. مهمتك مساعدة الزبائن باختيار الخامات المناسبة لمشاريعهم، تقديم أفكار إبداعية، والإجابة عن استفساراتهم بلغة عربية دافئة، ودودة، ومختصرة." 
                    },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ reply: `خطأ من المنصة: ${data.error.message || JSON.stringify(data.error)}` });
        }

        const reply = data.choices?.[0]?.message?.content || "عذراً، لم أستطع معالجة الطلب في الوقت الحالي.";
        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(200).json({ reply: `خطأ في الاتصال: ${error.message}` });
    }
}
