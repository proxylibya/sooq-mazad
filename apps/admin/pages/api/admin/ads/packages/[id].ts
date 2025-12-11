import prisma from '@sooq-mazad/database';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Package ID is required' });
    }

    try {
        switch (req.method) {
            case 'GET':
                return await getPackage(id, res);
            case 'PUT':
                return await updatePackage(id, req, res);
            case 'DELETE':
                return await deletePackage(id, res);
            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error('Package API Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function getPackage(id: string, res: NextApiResponse) {
    const adPackage = await prisma.adPackage.findUnique({
        where: { id },
        include: {
            _count: {
                select: { campaigns: true },
            },
        },
    });

    if (!adPackage) {
        return res.status(404).json({ message: 'Package not found' });
    }

    return res.status(200).json({ package: adPackage });
}

async function updatePackage(id: string, req: NextApiRequest, res: NextApiResponse) {
    const { name, nameAr, description, price, duration, type, features, isActive } = req.body;

    const existingPackage = await prisma.adPackage.findUnique({ where: { id } });
    if (!existingPackage) {
        return res.status(404).json({ message: 'Package not found' });
    }

    const updatedPackage = await prisma.adPackage.update({
        where: { id },
        data: {
            name: name !== undefined ? name : existingPackage.name,
            nameAr: nameAr !== undefined ? nameAr : existingPackage.nameAr,
            description: description !== undefined ? description : existingPackage.description,
            price: price !== undefined ? parseFloat(price) : existingPackage.price,
            duration: duration !== undefined ? parseInt(duration, 10) : existingPackage.duration,
            type: type !== undefined ? type : existingPackage.type,
            features: features !== undefined ? features : existingPackage.features,
            isActive: isActive !== undefined ? isActive : existingPackage.isActive,
        },
    });

    return res.status(200).json({ package: updatedPackage, message: 'Package updated successfully' });
}

async function deletePackage(id: string, res: NextApiResponse) {
    const existingPackage = await prisma.adPackage.findUnique({ where: { id } });
    if (!existingPackage) {
        return res.status(404).json({ message: 'Package not found' });
    }

    // Check if any campaigns are using this package
    const campaignsCount = await prisma.adCampaign.count({ where: { packageId: id } });
    if (campaignsCount > 0) {
        return res.status(400).json({
            message: `Cannot delete package. It is used by ${campaignsCount} campaign(s).`,
        });
    }

    await prisma.adPackage.delete({ where: { id } });

    return res.status(200).json({ message: 'Package deleted successfully' });
}
