import prisma from '@sooq-mazad/database';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'GET':
                return await getPackages(req, res);
            case 'POST':
                return await createPackage(req, res);
            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error('Packages API Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function getPackages(req: NextApiRequest, res: NextApiResponse) {
    const { search, type, isActive } = req.query;

    const where: any = {};

    if (search) {
        where.OR = [
            { name: { contains: String(search), mode: 'insensitive' } },
            { nameAr: { contains: String(search), mode: 'insensitive' } },
            { description: { contains: String(search), mode: 'insensitive' } },
        ];
    }

    if (type) {
        where.type = String(type);
    }

    if (isActive !== undefined) {
        where.isActive = isActive === 'true';
    }

    const packages = await prisma.adPackage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { campaigns: true },
            },
        },
    });

    return res.status(200).json({ packages });
}

async function createPackage(req: NextApiRequest, res: NextApiResponse) {
    const { name, nameAr, description, price, duration, type, features, isActive } = req.body;

    if (!name || !price || !duration) {
        return res.status(400).json({ message: 'Name, price, and duration are required' });
    }

    const newPackage = await prisma.adPackage.create({
        data: {
            name,
            nameAr: nameAr || null,
            description: description || null,
            price: parseFloat(price),
            duration: parseInt(duration, 10),
            type: type || 'GENERAL',
            features: features || [],
            isActive: isActive !== false,
        },
    });

    return res.status(201).json({ package: newPackage, message: 'Package created successfully' });
}
