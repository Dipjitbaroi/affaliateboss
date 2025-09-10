// Links Controller
// Contains business logic for link management operations

import { getDatabase } from '../../lib/prisma.js';

export class LinksController {
    // Get all affiliate links for the authenticated user
    static async getLinks(req, res) {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            const db = getDatabase();

            const links = await db.affiliateLink.findMany({
                where: {
                    userId: userId
                },
                select: {
                    id: true,
                    name: true,
                    shortCode: true,
                    shortUrl: true,
                    originalUrl: true,
                    totalClicks: true,
                    totalConversions: true,
                    totalEarnings: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            const data = links.map(link => ({
                id: link.id,
                name: link.name,
                short_url: link.shortUrl,
                original_url: link.originalUrl,
                short_code: link.shortCode,
                clicks: link.totalClicks,
                conversions: link.totalConversions,
                earnings: link.totalEarnings,
                status: link.status,
                created_at: link.createdAt.toISOString()
            }));

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Get links error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch links'
            });
        }
    }

    // Create new affiliate link
    static async createLink(req, res) {
        try {
            const userId = req.user?.userId;
            const { name, original_url, description } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            if (!name || !original_url) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and original URL are required',
                    error: 'MISSING_REQUIRED_FIELDS'
                });
            }

            const db = getDatabase();

            // Generate short code
            const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const shortUrl = `${process.env.BASE_URL || 'https://aff.ly'}/${shortCode}`;

            const newLink = await db.affiliateLink.create({
                data: {
                    userId: userId,
                    name: name,
                    description: description || '',
                    originalUrl: original_url,
                    shortCode: shortCode,
                    shortUrl: shortUrl,
                    status: 'ACTIVE'
                },
                select: {
                    id: true,
                    name: true,
                    shortCode: true,
                    shortUrl: true,
                    originalUrl: true,
                    totalClicks: true,
                    totalConversions: true,
                    totalEarnings: true,
                    status: true,
                    createdAt: true
                }
            });

            const responseData = {
                id: newLink.id,
                name: newLink.name,
                short_url: newLink.shortUrl,
                original_url: newLink.originalUrl,
                short_code: newLink.shortCode,
                clicks: newLink.totalClicks,
                conversions: newLink.totalConversions,
                earnings: newLink.totalEarnings,
                status: newLink.status,
                created_at: newLink.createdAt.toISOString()
            };

            res.status(201).json({
                success: true,
                message: 'Link created successfully',
                data: responseData
            });
        } catch (error) {
            console.error('Create link error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create link'
            });
        }
    }

    // Get single link by ID
    static async getLink(req, res) {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            const db = getDatabase();

            const link = await db.affiliateLink.findFirst({
                where: {
                    id: parseInt(id),
                    userId: userId
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    shortCode: true,
                    shortUrl: true,
                    originalUrl: true,
                    totalClicks: true,
                    totalConversions: true,
                    totalEarnings: true,
                    conversionRate: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!link) {
                return res.status(404).json({
                    success: false,
                    message: 'Link not found',
                    error: 'LINK_NOT_FOUND'
                });
            }

            const data = {
                id: link.id,
                name: link.name,
                description: link.description,
                short_url: link.shortUrl,
                original_url: link.originalUrl,
                short_code: link.shortCode,
                clicks: link.totalClicks,
                conversions: link.totalConversions,
                earnings: link.totalEarnings,
                conversion_rate: link.conversionRate,
                status: link.status,
                created_at: link.createdAt.toISOString(),
                updated_at: link.updatedAt.toISOString()
            };

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Get link error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch link'
            });
        }
    }

    // Update link
    static async updateLink(req, res) {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;
            const { name, original_url, description, status } = req.body;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            const db = getDatabase();

            const updatedLink = await db.affiliateLink.updateMany({
                where: {
                    id: parseInt(id),
                    userId: userId
                },
                data: {
                    ...(name && { name }),
                    ...(original_url && { originalUrl: original_url }),
                    ...(description !== undefined && { description }),
                    ...(status && { status })
                }
            });

            if (updatedLink.count === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Link not found or unauthorized',
                    error: 'LINK_NOT_FOUND'
                });
            }

            // Get the updated link
            const link = await db.affiliateLink.findUnique({
                where: { id: parseInt(id) },
                select: {
                    id: true,
                    name: true,
                    shortCode: true,
                    shortUrl: true,
                    originalUrl: true,
                    totalClicks: true,
                    totalConversions: true,
                    totalEarnings: true,
                    status: true,
                    createdAt: true
                }
            });

            const data = {
                id: link.id,
                name: link.name,
                short_url: link.shortUrl,
                original_url: link.originalUrl,
                short_code: link.shortCode,
                clicks: link.totalClicks,
                conversions: link.totalConversions,
                earnings: link.totalEarnings,
                status: link.status,
                created_at: link.createdAt.toISOString()
            };

            res.json({
                success: true,
                message: 'Link updated successfully',
                data: data
            });
        } catch (error) {
            console.error('Update link error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update link'
            });
        }
    }

    // Delete link
    static async deleteLink(req, res) {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                    error: 'NO_USER_ID'
                });
            }

            const db = getDatabase();

            const deletedLink = await db.affiliateLink.deleteMany({
                where: {
                    id: parseInt(id),
                    userId: userId
                }
            });

            if (deletedLink.count === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Link not found or unauthorized',
                    error: 'LINK_NOT_FOUND'
                });
            }

            res.json({
                success: true,
                message: 'Link deleted successfully'
            });
        } catch (error) {
            console.error('Delete link error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete link'
            });
        }
    }
}
