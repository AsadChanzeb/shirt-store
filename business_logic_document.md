# Project Code Business Logic Class
For
CUSTOM SHIRT STORE & CUSTOMIZATION SYSTEM
Version 1.1

Prepared By
Shehryar Sarwar
Zarish Zafar
25,May,2026

## Revision History
| Version | Description | Author | Date |
| :--- | :--- | :--- | :--- |
| 1.1 | This Document covers major Database Schema structure and Project Code (API route handlers & services). | Shehryar Sarwar<br>Zarish Zafar | 25,May, 2026 |

---

## Database Schema (Data Models & Classes)

The database schema definition for the Custom Shirt Store, showcasing models, attributes, relationships, and authentication enums.

```prisma
enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  orders        Order[]
  cart          Cart?
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Category {
  id       String    @id @default(cuid())
  name     String
  slug     String    @unique
  products Product[]
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Decimal  @db.Decimal(10, 2)
  discount    Decimal  @default(0) @db.Decimal(10, 2)
  categoryId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category Category        @relation(fields: [categoryId], references: [id])
  variants ProductVariant[]
  images   ProductImage[]
}

model ProductVariant {
  id        String @id @default(cuid())
  productId String
  size      String
  color     String
  stock     Int

  product    Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  cartItems  CartItem[]
  orderItems OrderItem[]
}

model ProductImage {
  id        String @id @default(cuid())
  productId String
  imageUrl  String
  color     String?

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model Cart {
  id     String @id @default(cuid())
  userId String @unique

  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items CartItem[]
}

model CartItem {
  id                     String  @id @default(cuid())
  cartId                 String
  productVariantId       String
  quantity               Int
  customText             String?
  customTextColor        String?
  customTextSize         Int?
  customTextFont         String?
  customTextX            Float?
  customTextY            Float?
  customLogoData         Bytes?
  customLogoX            Float?
  customLogoY            Float?
  customLogoScale        Int?
  customPreviewFrontData Bytes?
  customPreviewBackData  Bytes?

  cart    Cart           @relation(fields: [cartId], references: [id], onDelete: Cascade)
  variant ProductVariant @relation(fields: [productVariantId], references: [id])
}

model Order {
  id            String      @id @default(cuid())
  userId        String
  totalAmount   Decimal     @db.Decimal(10, 2)
  paymentMethod String      @default("ONLINE")
  status        OrderStatus @default(PENDING)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  user    User        @relation(fields: [userId], references: [id])
  items   OrderItem[]
  payment Payment?
}

model OrderItem {
  id                     String  @id @default(cuid())
  orderId                String
  productVariantId       String
  quantity               Int
  price                  Decimal @db.Decimal(10, 2)
  customText             String?
  customTextColor        String?
  customTextSize         Int?
  customTextFont         String?
  customTextX            Float?
  customTextY            Float?
  customLogoX            Float?
  customLogoY            Float?
  customLogoScale        Int?
  customLogoData         Bytes?
  customPreviewFrontData Bytes?
  customPreviewBackData  Bytes?

  order   Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variant ProductVariant @relation(fields: [productVariantId], references: [id])
}

model Payment {
  id                    String @id @default(cuid())
  orderId               String @unique
  stripePaymentIntentId String
  status                String

  order Order @relation(fields: [orderId], references: [id])
}
```

---

## Project Code (Business Logic & API Controllers)

### Admin

#### 1 - Admin Users Controller (`src/app/api/admin/users/route.ts`)
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const users = await prisma.user.findMany({
            select: { 
                id: true, 
                name: true, 
                email: true, 
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

#### 2 - Admin User Create Controller (`src/app/api/admin/users/create/route.ts`)
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name, email, password, role } = await req.json();

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name: name || email,
                email,
                password: hashedPassword,
                role: role === 'ADMIN' ? 'ADMIN' : 'USER',
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            { message: 'User created successfully', user },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

#### 3 - Admin User Update Role Controller (`src/app/api/admin/users/update-role/route.ts`)
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { userId, role } = await req.json();

        // Validate input
        if (!userId || !['USER', 'ADMIN'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid request' },
                { status: 400 }
            );
        }

        // Prevent admin from removing own admin role
        if (userId === (session.user as any)?.id && role === 'USER') {
            return NextResponse.json(
                { error: 'Cannot remove your own admin role' },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

#### 4 - Admin Products Store Controller (`src/app/api/admin/products/route.ts`)
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, description, price, discount, categoryId, images, variants } = body;

        // Basic validation
        if (!name || !description || !price || !categoryId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (isNaN(Number(price)) || Number(price) < 0) {
            return NextResponse.json(
                { error: 'Price must be a positive number' },
                { status: 400 }
            );
        }

        if (discount && (isNaN(Number(discount)) || Number(discount) < 0 || Number(discount) > 100)) {
            return NextResponse.json(
                { error: 'Discount must be a number between 0 and 100' },
                { status: 400 }
            );
        }

        if (!variants || !Array.isArray(variants) || variants.length === 0) {
            return NextResponse.json(
                { error: 'At least one product variant is required' },
                { status: 400 }
            );
        }

        // Validate variants
        for (const variant of variants) {
            if (!variant.size || !variant.color || variant.stock === undefined || isNaN(Number(variant.stock)) || Number(variant.stock) < 0) {
                return NextResponse.json(
                    { error: 'Each variant must have a valid size, color, and positive stock quantity' },
                    { status: 400 }
                );
            }
        }

        // Create product with relation records nested
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: Number(price),
                discount: Number(discount || 0),
                categoryId,
                images: {
                    create: (images || []).map((url: string) => ({
                        imageUrl: url,
                    })),
                },
                variants: {
                    create: variants.map((v: any) => ({
                        size: v.size,
                        color: v.color,
                        stock: parseInt(v.stock, 10),
                    })),
                },
            },
            include: {
                images: true,
                variants: true,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

#### 5 - Admin Product Update & Delete Controller (`src/app/api/admin/products/[id]/route.ts`)
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, description, price, discount, categoryId, images, variants } = body;

        // Basic validation
        if (!name || !description || !price || !categoryId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (isNaN(Number(price)) || Number(price) < 0) {
            return NextResponse.json(
                { error: 'Price must be a positive number' },
                { status: 400 }
            );
        }

        if (discount && (isNaN(Number(discount)) || Number(discount) < 0 || Number(discount) > 100)) {
            return NextResponse.json(
                { error: 'Discount must be a number between 0 and 100' },
                { status: 400 }
            );
        }

        if (!variants || !Array.isArray(variants) || variants.length === 0) {
            return NextResponse.json(
                { error: 'At least one product variant is required' },
                { status: 400 }
            );
        }

        // Validate variants
        for (const variant of variants) {
            if (!variant.size || !variant.color || variant.stock === undefined || isNaN(Number(variant.stock)) || Number(variant.stock) < 0) {
                return NextResponse.json(
                    { error: 'Each variant must have a valid size, color, and positive stock quantity' },
                    { status: 400 }
                );
            }
        }

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id },
            include: { variants: true }
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Perform transaction for updates
        const updatedProduct = await prisma.$transaction(async (tx) => {
            // 1. Update basic product details
            const prod = await tx.product.update({
                where: { id },
                data: {
                    name,
                    description,
                    price: Number(price),
                    discount: Number(discount || 0),
                    categoryId,
                }
            });

            // 2. Reconcile images (delete existing and recreate)
            await tx.productImage.deleteMany({
                where: { productId: id }
            });
            if (images && images.length > 0) {
                await tx.productImage.createMany({
                    data: images.map((url: string) => ({
                        productId: id,
                        imageUrl: url,
                    }))
                });
            }

            // 3. Reconcile variants (Keep existing ones matching by ID, create new, delete omitted)
            const inputVariantIds = variants.map(v => v.id).filter(Boolean);
            const currentVariantIds = existingProduct.variants.map(v => v.id);
            const variantsToDelete = currentVariantIds.filter(cid => !inputVariantIds.includes(cid));

            // Delete variants that were removed
            if (variantsToDelete.length > 0) {
                await tx.productVariant.deleteMany({
                    where: {
                        id: { in: variantsToDelete }
                    }
                });
            }

            // Update existing variants
            for (const v of variants) {
                if (v.id) {
                    await tx.productVariant.update({
                        where: { id: v.id },
                        data: {
                            size: v.size,
                            color: v.color,
                            stock: parseInt(v.stock, 10),
                        }
                    });
                }
            }

            // Create new variants
            const newVariants = variants.filter(v => !v.id);
            if (newVariants.length > 0) {
                await tx.productVariant.createMany({
                    data: newVariants.map((v: any) => ({
                        productId: id,
                        size: v.size,
                        color: v.color,
                        stock: parseInt(v.stock, 10),
                    }))
                });
            }

            return prod;
        });

        // Get final fully updated product to return
        const finalProduct = await prisma.product.findUnique({
            where: { id: updatedProduct.id },
            include: {
                images: true,
                variants: true,
            }
        });

        return NextResponse.json(finalProduct);
    } catch (error: any) {
        console.error('Error updating product:', error);
        
        // Handle database referential constraints during variant deletion
        if (error.code === 'P2003') {
            return NextResponse.json(
                { error: 'Cannot delete some of the removed variants because they are associated with existing cart items or orders. Modify their details instead of deleting them.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // First, fetch the product with its variants to get variant IDs
        const product = await prisma.product.findUnique({
            where: { id },
            include: { variants: true },
        });
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        const variantIds = product.variants.map((v) => v.id);

        // Delete related cart items and order items for these variants to avoid FK violations
        if (variantIds.length > 0) {
            await prisma.cartItem.deleteMany({
                where: { productVariantId: { in: variantIds } },
            });
            await prisma.orderItem.deleteMany({
                where: { productVariantId: { in: variantIds } },
            });
        }

        // Now delete the product (cascade will delete variants and images)
        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting product:', error);

        // Specific handling for foreign key constraint errors
        if (error.code === 'P2003') {
            return NextResponse.json(
                { error: 'Cannot delete this product because it is linked to existing cart items or orders. Consider removing those references first.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

#### 6 - Admin Order Status Update Controller (`src/app/api/orders/update-status/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId, status } = await req.json();

        await prisma.order.update({
            where: { id: orderId },
            data: { status },
        });

        return NextResponse.json({ message: 'Status updated' }, { status: 200 });
    } catch (error) {
        console.error('Update status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
```

---

### Auth

#### 1 - Auth Register Controller (`src/app/api/auth/register/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER',
            },
        });

        return NextResponse.json(
            { message: 'User created successfully', userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

#### 2 - NextAuth Catch-all Handler (`src/app/api/auth/[...nextauth]/route.ts`)
```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

#### 3 - NextAuth Options Config Service (`src/lib/auth.ts`)
```typescript
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET,
};
```

---

### User Operations

#### 1 - Cart Item Store Controller (`src/app/api/cart/add/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            variantId,
            quantity,
            customText,
            customTextColor,
            customTextSize,
            customTextFont,
            customTextX,
            customTextY,
            customLogoData,
            customLogoX,
            customLogoY,
            customLogoScale,
            customPreviewFrontData,
            customPreviewBackData,
        } = await req.json();

        if (!variantId || !quantity) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const userId = (session.user as any).id;

        // Get or create cart
        let cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
            });
        }

        // Check if item with identical customization is already in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productVariantId: variantId,
                customText: customText || null,
                customTextColor: customTextColor || null,
                customTextSize: customTextSize ? Number(customTextSize) : null,
                customTextFont: customTextFont || null,
                customTextX: customTextX ? Number(customTextX) : null,
                customTextY: customTextY ? Number(customTextY) : null,
                customLogoX: customLogoX ? Number(customLogoX) : null,
                customLogoY: customLogoY ? Number(customLogoY) : null,
                customLogoScale: customLogoScale ? Number(customLogoScale) : null,
            },
        });

        if (existingItem) {
            // Update quantity
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            // Add new item
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productVariantId: variantId,
                    quantity,
                    customText: customText || null,
                    customTextColor: customTextColor || null,
                    customTextSize: customTextSize ? Number(customTextSize) : null,
                    customTextFont: customTextFont || null,
                    customTextX: customTextX ? Number(customTextX) : null,
                    customTextY: customTextY ? Number(customTextY) : null,
                    customLogoData: customLogoData ? Buffer.from(customLogoData, 'base64') : null,
                    customLogoX: customLogoX ? Number(customLogoX) : null,
                    customLogoY: customLogoY ? Number(customLogoY) : null,
                    customLogoScale: customLogoScale ? Number(customLogoScale) : null,
                    customPreviewFrontData: customPreviewFrontData ? Buffer.from(customPreviewFrontData, 'base64') : null,
                    customPreviewBackData: customPreviewBackData ? Buffer.from(customPreviewBackData, 'base64') : null,
                },
            });
        }

        return NextResponse.json({ message: 'Added to cart' }, { status: 200 });
    } catch (error) {
        console.error('Add to cart error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
```

#### 2 - Cart Item Remove Controller (`src/app/api/cart/remove/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const itemId = searchParams.get('itemId');

        if (!itemId) {
            return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
        }

        await prisma.cartItem.delete({
            where: { id: itemId },
        });

        return NextResponse.json({ message: 'Removed from cart' }, { status: 200 });
    } catch (error) {
        console.error('Remove from cart error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
```

#### 3 - Custom Shirt Customization Add-to-Cart Controller (`src/app/api/customize/add-to-cart/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const {
            size,
            color,
            customText,
            customTextColor,
            customTextSize,
            customTextFont,
            customTextX,
            customTextY,
            customLogoX,
            customLogoY,
            customLogoScale,
            customLogoData,
            customPreviewFrontData,
            customPreviewBackData,
        } = await req.json();

        // 1. Find or create a Customizable Product
        let product = await prisma.product.findFirst({
            where: { name: 'Customizable T-Shirt' },
        });

        if (!product) {
            let category = await prisma.category.findFirst();
            if (!category) {
                category = await prisma.category.create({
                    data: { name: 'Customizable', slug: 'customizable' },
                });
            }

            product = await prisma.product.create({
                data: {
                    name: 'Customizable T-Shirt',
                    description: 'Your own custom designed premium t-shirt with print placement options.',
                    price: 34.99,
                    discount: 0,
                    categoryId: category.id,
                },
            });
        }

        // 2. Find or create the ProductVariant matching the selected size and color
        let variant = await prisma.productVariant.findFirst({
            where: {
                productId: product.id,
                size,
                color,
            },
        });

        if (!variant) {
            variant = await prisma.productVariant.create({
                data: {
                    productId: product.id,
                    size,
                    color,
                    stock: 999, // default stock for custom print orders
                },
            });
        }

        // 3. Find or create the Cart
        let cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
            });
        }

        // 4. Create the CartItem
        // Check if there is already a CartItem with the exact same custom options and variant
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productVariantId: variant.id,
                customText: customText || null,
                customTextColor: customTextColor || null,
                customTextSize: customTextSize ? Number(customTextSize) : null,
                customTextFont: customTextFont || null,
                customTextX: customTextX ? Number(customTextX) : null,
                customTextY: customTextY ? Number(customTextY) : null,
                customLogoData: customLogoData ? Buffer.from(customLogoData, 'base64') : null,
                customLogoX: customLogoX ? Number(customLogoX) : null,
                customLogoY: customLogoY ? Number(customLogoY) : null,
                customLogoScale: customLogoScale ? Number(customLogoScale) : null,
                customPreviewFrontData: customPreviewFrontData ? Buffer.from(customPreviewFrontData, 'base64') : null,
                customPreviewBackData: customPreviewBackData ? Buffer.from(customPreviewBackData, 'base64') : null,
            },
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + 1 },
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productVariantId: variant.id,
                    quantity: 1,
                    customText: customText || null,
                    customTextColor: customTextColor || null,
                    customTextSize: customTextSize ? Number(customTextSize) : null,
                    customTextFont: customTextFont || null,
                    customTextX: customTextX ? Number(customTextX) : null,
                    customTextY: customTextY ? Number(customTextY) : null,
                    customLogoData: customLogoData ? Buffer.from(customLogoData, 'base64') : null,
                    customLogoX: customLogoX ? Number(customLogoX) : null,
                    customLogoY: customLogoY ? Number(customLogoY) : null,
                    customLogoScale: customLogoScale ? Number(customLogoScale) : null,
                    customPreviewFrontData: customPreviewFrontData ? Buffer.from(customPreviewFrontData, 'base64') : null,
                    customPreviewBackData: customPreviewBackData ? Buffer.from(customPreviewBackData, 'base64') : null,
                },
            });
        }

        return NextResponse.json({ success: true, message: 'Added to cart' }, { status: 200 });
    } catch (error) {
        console.error('Error adding custom design to cart:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
```

#### 4 - Order Placement & Checkout Controller (`src/app/api/orders/create/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-12-15.clover',
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const { paymentMethod = 'ONLINE' } = await req.json();

        // Fetch cart securely from DB
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Calculate total securely on backend
        const total = cart.items.reduce((sum, item) => {
            const price = Number(item.variant.product.price);
            const discount = Number(item.variant.product.discount);
            const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;
            return sum + finalPrice * item.quantity;
        }, 0);

        // Create order
        const order = await prisma.order.create({
            data: {
                userId,
                totalAmount: total,
                paymentMethod: paymentMethod,
                status: 'PENDING',
                items: {
                    create: cart.items.map((item) => ({
                        productVariantId: item.variant.id,
                        quantity: item.quantity,
                        price:
                            Number(item.variant.product.price) -
                            (Number(item.variant.product.price) * Number(item.variant.product.discount)) / 100,
                        customText: item.customText || null,
                        customTextColor: item.customTextColor || null,
                        customTextSize: item.customTextSize ? Number(item.customTextSize) : null,
                        customTextFont: item.customTextFont || null,
                        customTextX: item.customTextX ? Number(item.customTextX) : null,
                        customTextY: item.customTextY ? Number(item.customTextY) : null,
                        customLogoData: item.customLogoData || null,
                        customLogoX: item.customLogoX ? Number(item.customLogoX) : null,
                        customLogoY: item.customLogoY ? Number(item.customLogoY) : null,
                        customLogoScale: item.customLogoScale ? Number(item.customLogoScale) : null,
                        customPreviewFrontData: item.customPreviewFrontData || null,
                        customPreviewBackData: item.customPreviewBackData || null,
                    })),
                },
            },
        });

        // Clear cart
        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });

        // Update stock
        for (const item of cart.items) {
            await prisma.productVariant.update({
                where: { id: item.variant.id },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        if (paymentMethod === 'COD') {
            // For Cash on Delivery, bypass Stripe and return the orderId
            return NextResponse.json({ url: null, orderId: order.id }, { status: 201 });
        }

        // Create Stripe checkout session
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        
        const lineItems = cart.items.map((item) => {
            const price = Number(item.variant.product.price);
            const discount = Number(item.variant.product.discount);
            const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;
            
            return {
                price_data: {
                    currency: 'pkr',
                    product_data: {
                        name: `${item.variant.product.name} - Size: ${item.variant.size}`,
                    },
                    unit_amount: Math.round(finalPrice * 100), // Stripe expects amounts in cents
                },
                quantity: item.quantity,
            };
        });

        const sessionStripe = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${baseUrl}/orders/${order.id}?success=true`,
            cancel_url: `${baseUrl}/cart`,
            metadata: {
                orderId: order.id,
            },
        });

        return NextResponse.json({ url: sessionStripe.url }, { status: 201 });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
```

#### 5 - User Profile Info Update Controller (`src/app/api/user/profile/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
        });
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json({ hasPassword: !!user.password });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, currentPassword, newPassword } = await req.json();

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updateData: any = { name };

        // Handle password update if provided
        if (newPassword) {
            if (user.password) {
                // If user already has a password, verify the current one
                if (!currentPassword) {
                    return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
                }
                const isValid = await bcrypt.compare(currentPassword, user.password);
                if (!isValid) {
                    return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
                }
            }
            
            // Hash the new password
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: updateData,
        });

        return NextResponse.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
```

#### 6 - File / Custom Logo Upload Controller (`src/app/api/upload/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is logged in
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const data = await req.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate that file is indeed an image
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define path in public folder
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        
        // Ensure directory exists
        await fs.mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const uniqueId = crypto.randomUUID();
        const originalName = file.name || 'image.jpg';
        const fileExt = path.extname(originalName).toLowerCase() || '.jpg';
        const filename = `${uniqueId}${fileExt}`;
        const filePath = path.join(uploadDir, filename);

        // Write file
        await fs.writeFile(filePath, buffer);

        // Public URL reference
        const imageUrl = `/uploads/${filename}`;

        return NextResponse.json({ url: imageUrl });
    } catch (error) {
        console.error('Error during upload:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}
```

#### 7 - Order Item Image Retrieval Controller (`src/app/api/images/order-item/[id]/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  // Fetch the order item with the required binary fields
  const item = await prisma.orderItem.findUnique({
    where: { id },
    select: {
      customLogoData: true,
      customPreviewFrontData: true,
      customPreviewBackData: true,
    },
  });

  if (!item) {
    return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
  }

  let data: Buffer | null = null;
  switch (type) {
    case 'logo':
      data = item.customLogoData ? Buffer.from(item.customLogoData) : null;
      break;
    case 'front':
      data = item.customPreviewFrontData ? Buffer.from(item.customPreviewFrontData) : null;
      break;
    case 'back':
      data = item.customPreviewBackData ? Buffer.from(item.customPreviewBackData) : null;
      break;
    default:
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Image data not available' }, { status: 404 });
  }

  const response = new NextResponse(data as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
    },
    status: 200,
  });
  return response;
}
```

---

### Stripe Webhook

#### 1 - Stripe Callback Event Webhook (`src/app/api/webhooks/stripe/route.ts`)
```typescript
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-12-15.clover',
});

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not set');
        }

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        );
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const orderId = session.metadata?.orderId;

        if (orderId) {
            try {
                // Update the order status to PAID
                await prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'PAID' },
                });

                // Create or update the payment record
                await prisma.payment.upsert({
                    where: { orderId: orderId },
                    update: {
                        status: 'succeeded',
                        stripePaymentIntentId: (session.payment_intent as string) || session.id,
                    },
                    create: {
                        orderId: orderId,
                        status: 'succeeded',
                        stripePaymentIntentId: (session.payment_intent as string) || session.id,
                    },
                });
                console.log(`Order ${orderId} marked as PAID`);
            } catch (error) {
                console.error(`Error updating order ${orderId}:`, error);
                return new NextResponse('Error updating order', { status: 500 });
            }
        }
    }

    return new NextResponse('Webhook received', { status: 200 });
}
```

---

### Core Business Logic Services

#### 1 - Design HTML5 Canvas Composite Renderer Service (`src/lib/designRenderer.ts`)
```typescript
interface DesignData {
    logoPreview: string | null;
    logoScale: number;
    logoPosition: { x: number; y: number };
    customText: string;
    fontFamily: string;
    textColor: string;
    textSize: number;
    textPosition: { x: number; y: number };
    shirtColor?: string;
}

const loadCanvasImage = async (src: string): Promise<HTMLImageElement> => {
    const image = document.createElement('img');
    image.decoding = 'async';

    if (src.startsWith('blob:') || src.startsWith('data:')) {
        image.src = src;
    } else {
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            image.src = URL.createObjectURL(blob);
        } catch {
            image.crossOrigin = 'anonymous';
            image.src = src;
        }
    }

    await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Image could not be loaded'));
    });

    return image;
};

const drawCoveredImage = (
    context: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number
) => {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    const sourceX = (image.naturalWidth - sourceWidth) / 2;
    const sourceY = (image.naturalHeight - sourceHeight) / 2;

    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
};

const drawContainedImage = (
    context: CanvasRenderingContext2D,
    image: HTMLImageElement,
    centerX: number,
    y: number,
    maxWidth: number
) => {
    const width = maxWidth;
    const height = width * (image.naturalHeight / image.naturalWidth);
    context.drawImage(image, centerX - width / 2, y, width, height);
    return height;
};

const getWrappedLines = (
    context: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
) => {
    const lines: string[] = [];
    const words = text.split(/\s+/).filter(Boolean);
    let currentLine = '';

    words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;

        if (context.measureText(testLine).width <= maxWidth) {
            currentLine = testLine;
            return;
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        if (context.measureText(word).width <= maxWidth) {
            currentLine = word;
            return;
        }

        let chunk = '';
        Array.from(word).forEach((letter) => {
            const testChunk = `${chunk}${letter}`;

            if (context.measureText(testChunk).width <= maxWidth) {
                chunk = testChunk;
                return;
            }

            if (chunk) {
                lines.push(chunk);
            }
            chunk = letter;
        });
        currentLine = chunk;
    });

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
};

export async function renderDesignToBlob(
    shirtTemplateUrl: string,
    design: DesignData
): Promise<Blob | null> {
    try {
        const canvasSize = 1200;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            return null;
        }

        canvas.width = canvasSize;
        canvas.height = canvasSize;

        // Draw background shirt template
        const shirtImage = await loadCanvasImage(shirtTemplateUrl);
        const isCustomTemplate = shirtTemplateUrl.includes('shirt-front') || shirtTemplateUrl.includes('shirt-back');
        
        if (isCustomTemplate && design.shirtColor) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasSize;
            tempCanvas.height = canvasSize;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                drawCoveredImage(tempCtx, shirtImage, 0, 0, canvasSize, canvasSize);
                tempCtx.globalCompositeOperation = 'source-in';
                tempCtx.fillStyle = design.shirtColor;
                tempCtx.fillRect(0, 0, canvasSize, canvasSize);
                tempCtx.globalCompositeOperation = 'multiply';
                drawCoveredImage(tempCtx, shirtImage, 0, 0, canvasSize, canvasSize);
                context.drawImage(tempCanvas, 0, 0);
            } else {
                drawCoveredImage(context, shirtImage, 0, 0, canvasSize, canvasSize);
            }
        } else {
            drawCoveredImage(context, shirtImage, 0, 0, canvasSize, canvasSize);
        }

        // Base display values for calculation
        const baseDisplayWidth = 500; // Reference display width
        const scale = canvasSize / baseDisplayWidth;
        const baseOverlayWidth = 208; // Base width from UI (w-52)
        const overlayWidth = baseOverlayWidth * scale;
        const canvasTextSize = design.textSize * scale * 0.7; // Tweak scale relative to display size

        let logoImage: HTMLImageElement | null = null;
        let logoHeight = 0;
        let textHeight = 0;
        let textLines: string[] = [];

        context.font = `700 ${canvasTextSize}px "${design.fontFamily}", sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'top';

        // Apply shadow/effects
        context.shadowColor = 'rgba(0, 0, 0, 0.28)';
        context.shadowBlur = 10 * scale;
        context.shadowOffsetY = 2 * scale;

        const logoOverlayWidth = overlayWidth * (design.logoScale / 100);

        if (design.logoPreview) {
            logoImage = await loadCanvasImage(design.logoPreview);
            logoHeight = logoOverlayWidth * (logoImage.naturalHeight / logoImage.naturalWidth);
        }

        if (design.customText.trim()) {
            textLines = getWrappedLines(context, design.customText.trim(), overlayWidth);
            textHeight = textLines.length * canvasTextSize * 1.2;
        }

        if (logoImage) {
            const logoCenterX = canvasSize * (design.logoPosition.x / 100);
            const logoCenterY = canvasSize * (design.logoPosition.y / 100);
            drawContainedImage(context, logoImage, logoCenterX, logoCenterY - logoHeight / 2, logoOverlayWidth);
        }

        if (textLines.length > 0) {
            context.fillStyle = design.textColor;
            context.font = `700 ${canvasTextSize}px "${design.fontFamily}", sans-serif`;
            
            const textCenterX = canvasSize * (design.textPosition.x / 100);
            const textCenterY = canvasSize * (design.textPosition.y / 100);
            const startY = textCenterY - textHeight / 2;

            textLines.forEach((line, index) => {
                context.fillText(
                    line,
                    textCenterX,
                    startY + index * canvasTextSize * 1.2,
                    overlayWidth
                );
            });
        }

        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/png');
        });
    } catch (error) {
        console.error('Error rendering design to blob:', error);
        return null;
    }
}
```
