// Tools Controller
// Contains business logic for content generation and utility tools

export class ToolsController {
    // Generate content based on type and parameters
    static generateContent(req, res) {
        try {
            const { content_type, product_name, keywords, tone = 'professional' } = req.body;

            let content = '';

            switch (content_type) {
                case 'product_description':
                    content = `Discover the amazing ${product_name}! This incredible product features cutting-edge technology and premium quality. Perfect for anyone looking to ${keywords}. Don't miss out on this exclusive opportunity!`;
                    break;
                case 'email_campaign':
                    content = `Subject: Exclusive Deal on ${product_name}!\n\nHi there!\n\nI wanted to share this amazing product with you - ${product_name}. It's perfect for ${keywords} and I think you'll love it!\n\nCheck it out here: [Your Affiliate Link]\n\nBest regards,\n[Your Name]`;
                    break;
                case 'social_post':
                    content = `🔥 Just discovered ${product_name}! Perfect for ${keywords}. Highly recommended! #affiliate #${keywords.replace(/\s+/g, '')} [link]`;
                    break;
                case 'blog_post':
                    content = `# ${product_name} Review: Everything You Need to Know\n\n## Introduction\n${product_name} has been making waves in the market, and for good reason. In this comprehensive review, I'll share my experience with this product.\n\n## Key Features\n- Premium quality\n- Easy to use\n- Great value\n\n## Final Thoughts\nIf you're looking for ${keywords}, ${product_name} is definitely worth considering. [Affiliate Link]`;
                    break;
                default:
                    content = `Generated content for ${product_name} with focus on ${keywords}`;
            }

            res.json({
                success: true,
                data: {
                    content,
                    content_type,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Content generation error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate content'
            });
        }
    }

    // Generate QR code for URL
    static generateQRCode(req, res) {
        try {
            const { url, size = '200' } = req.query;

            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL parameter required'
                });
            }

            // Generate QR code URL using QR Server API (free service)
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;

            res.json({
                success: true,
                data: {
                    qr_url: qrUrl,
                    original_url: url,
                    size: size
                }
            });
        } catch (error) {
            console.error('QR code generation error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate QR code'
            });
        }
    }
}
