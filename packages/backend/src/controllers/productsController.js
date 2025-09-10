// Products Controller
// Contains business logic for product management operations

import { getDatabase } from '../../lib/prisma.js';

export class ProductsController {
    // Get all products
    static async getProducts(req, res) {
        try {
            const db = getDatabase();
            const { category, search, limit = 50, offset = 0 } = req.query;

            const where = {};
            if (category) {
                where.category = category;
            }
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }

            const products = await db.product.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    category: true,
                    commissionRate: true,
                    imageUrl: true,
                    totalSales: true,
                    totalRevenue: true,
                    status: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: parseInt(limit),
                skip: parseInt(offset)
            });

            const data = products.map(product => ({
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price,
                commission_rate: product.commissionRate,
                image: product.imageUrl,
                description: product.description,
                total_sales: product.totalSales,
                total_revenue: product.totalRevenue,
                status: product.status,
                created_at: product.createdAt.toISOString()
            }));

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Get products error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch products'
            });
        }
    }

    // Get single product by ID
    static async getProduct(req, res) {
        try {
            const { id } = req.params;
            const db = getDatabase();

            const product = await db.product.findUnique({
                where: { id: parseInt(id) },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    category: true,
                    commissionRate: true,
                    commissionType: true,
                    imageUrl: true,
                    sku: true,
                    stockQuantity: true,
                    trackInventory: true,
                    weight: true,
                    dimensions: true,
                    tags: true,
                    totalSales: true,
                    totalRevenue: true,
                    totalCommissionsPaid: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                    error: 'PRODUCT_NOT_FOUND'
                });
            }

            const data = {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                commission_rate: product.commissionRate,
                commission_type: product.commissionType,
                image: product.imageUrl,
                sku: product.sku,
                stock_quantity: product.stockQuantity,
                track_inventory: product.trackInventory,
                weight: product.weight,
                dimensions: product.dimensions,
                tags: product.tags,
                total_sales: product.totalSales,
                total_revenue: product.totalRevenue,
                total_commissions_paid: product.totalCommissionsPaid,
                status: product.status,
                created_at: product.createdAt.toISOString(),
                updated_at: product.updatedAt.toISOString()
            };

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Get product error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch product'
            });
        }
    }

    // Create new product
    static async createProduct(req, res) {
        try {
            const {
                name,
                description,
                price,
                category,
                commissionRate,
                commissionType = 'PERCENTAGE',
                imageUrl,
                sku,
                stockQuantity = 0,
                trackInventory = true,
                weight,
                dimensions,
                tags
            } = req.body;

            if (!name || !price || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, price, and category are required',
                    error: 'MISSING_REQUIRED_FIELDS'
                });
            }

            const db = getDatabase();

            const newProduct = await db.product.create({
                data: {
                    name,
                    description: description || '',
                    price: parseFloat(price),
                    category,
                    commissionRate: parseFloat(commissionRate) || 10,
                    commissionType,
                    imageUrl,
                    sku,
                    stockQuantity: parseInt(stockQuantity),
                    trackInventory,
                    weight,
                    dimensions,
                    tags: tags ? JSON.stringify(tags) : null,
                    status: 'ACTIVE'
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    category: true,
                    commissionRate: true,
                    imageUrl: true,
                    status: true,
                    createdAt: true
                }
            });

            const data = {
                id: newProduct.id,
                name: newProduct.name,
                description: newProduct.description,
                price: newProduct.price,
                category: newProduct.category,
                commission_rate: newProduct.commissionRate,
                image: newProduct.imageUrl,
                status: newProduct.status,
                created_at: newProduct.createdAt.toISOString()
            };

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: data
            });
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create product'
            });
        }
    }

    // Update product
    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const db = getDatabase();

            // Convert price and commission rate to numbers if provided
            if (updateData.price) {
                updateData.price = parseFloat(updateData.price);
            }
            if (updateData.commissionRate) {
                updateData.commissionRate = parseFloat(updateData.commissionRate);
            }
            if (updateData.stockQuantity) {
                updateData.stockQuantity = parseInt(updateData.stockQuantity);
            }

            // Handle tags as JSON
            if (updateData.tags) {
                updateData.tags = JSON.stringify(updateData.tags);
            }

            const updatedProduct = await db.product.update({
                where: { id: parseInt(id) },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    category: true,
                    commissionRate: true,
                    imageUrl: true,
                    status: true,
                    updatedAt: true
                }
            });

            const data = {
                id: updatedProduct.id,
                name: updatedProduct.name,
                description: updatedProduct.description,
                price: updatedProduct.price,
                category: updatedProduct.category,
                commission_rate: updatedProduct.commissionRate,
                image: updatedProduct.imageUrl,
                status: updatedProduct.status,
                updated_at: updatedProduct.updatedAt.toISOString()
            };

            res.json({
                success: true,
                message: 'Product updated successfully',
                data: data
            });
        } catch (error) {
            console.error('Update product error:', error);
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                    error: 'PRODUCT_NOT_FOUND'
                });
            }
            res.status(500).json({
                success: false,
                error: 'Failed to update product'
            });
        }
    }

    // Delete product
    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const db = getDatabase();

            await db.product.delete({
                where: { id: parseInt(id) }
            });

            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error) {
            console.error('Delete product error:', error);
            if (error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                    error: 'PRODUCT_NOT_FOUND'
                });
            }
            res.status(500).json({
                success: false,
                error: 'Failed to delete product'
            });
        }
    }

    // Get product categories
    static async getCategories(req, res) {
        try {
            const db = getDatabase();

            const categories = await db.product.findMany({
                select: {
                    category: true
                },
                distinct: ['category'],
                orderBy: {
                    category: 'asc'
                }
            });

            const data = categories.map(cat => cat.category);

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch categories'
            });
        }
    }
}
