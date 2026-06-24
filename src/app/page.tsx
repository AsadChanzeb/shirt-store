import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import Features from '@/components/Features';
import Reviews from '@/components/Reviews';
import { ArrowRight, Star, Users } from 'lucide-react';

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    take: 12,
    include: {
      images: { take: 2 },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="bg-white">
      {/* Hero Section with Mesh Gradient */}
      {/* Hero Section with Mesh Gradient */}
      <section className="relative h-screen flex items-center mesh-gradient overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-32 pb-10 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-between">
            {/* Left Column: Text Content */}
            <div className="w-full lg:w-[45%] max-w-3xl shrink-0">
              {/* Hero Heading - Mixed Fonts */}
              <h1 className="text-6xl md:text-7xl lg:text-[80px] xl:text-[90px] font-medium leading-[1.1] tracking-tight mb-6 font-serif-italic">
                Your Imagination. {' '}
                <span className="font-serif-italic" >Your Shirt</span>
              </h1>

              <p className="text-lg md:text-xl text-[#B1B1B1] mb-8 max-w-xl leading-relaxed">
                Design your perfect shirt from scratch with our live customization studio. Colors, graphics, fonts all in your hands. No design skills needed
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/customize">
                  <Button
                    size="lg"
                    className="bg-[#443DFF] hover:bg-[#3730E3] text-white rounded-full px-8 h-14 text-base font-medium"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-[#1B1D1E] rounded-full px-8 h-14 text-base font-medium hover:bg-[#1B1D1E] hover:text-white"
                  >
                    View Collection
                  </Button>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-[#B1B1B1]">Trusted by 1000+ clients</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div className="relative hidden lg:block w-full lg:w-[55%] xl:w-[60%]">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-all duration-500 ease-out border-4 border-white/20">
                <img
                  src="/images/Landing page.png"
                  alt="Diverse group of models wearing stylish shirts"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating Glass Element */}
              <div className="absolute -bottom-10 -left-10 glass p-6 rounded-2xl shadow-lg max-w-xs animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#443DFF] flex items-center justify-center text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Premium Fits</p>
                    <p className="text-sm text-gray-500">Tailored for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-[#B1B1B1] mb-16 text-lg">
            Loved by 1000+ big and small brands around the world
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="text-6xl font-bold mb-3">+500</div>
              <div className="text-[#B1B1B1]">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-3">+5</div>
              <div className="text-[#B1B1B1]">Years of Experience</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-3">+10</div>
              <div className="text-[#B1B1B1]">Design Awards</div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-3">100%</div>
              <div className="text-[#B1B1B1]">Quality Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-gray-50/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12">
          <div className="mb-20">
            <h2 className="text-5xl md:text-7xl font-medium mb-6 leading-tight">
              Crafting exceptional, well experienced & technology driven{' '}
              <span className="font-serif-italic">strategies</span> to drive impactful results
            </h2>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-12 gap-6 snap-x snap-mandatory scrollbar-hide px-6 lg:px-8">
          {featuredProducts.map((product) => (
            <div key={product.id} className="min-w-[260px] h-[40%] md:min-w-[320px] md:min-h-[320px] snap-center">
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={Number(product.price)}
                discount={Number(product.discount)}
                images={product.images.map(img => img.imageUrl)}
                slug={product.id}
              />
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12 text-center">
          <Link href="/shop">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#1B1D1E] rounded-full px-8 h-14 hover:bg-[#1B1D1E] hover:text-white"
            >
              View Portfolio
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 mesh-gradient">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-7xl font-medium mb-8 leading-tight">
            Where innovation meets{' '}
            <span className="font-serif-italic">aesthetics</span>
          </h2>
          <p className="text-xl text-[#B1B1B1] mb-12">
            See Our Work in Action. Start Your Creative Journey with Us!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-[#443DFF] hover:bg-[#3730E3] text-white rounded-full px-8 h-14"
              >
                Let's Collaborate
              </Button>
            </Link>
            <Link href="/shop">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#1B1D1E] rounded-full px-8 h-14 hover:bg-[#1B1D1E] hover:text-white"
              >
                View Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Reviews />
      <Features />
    </div>
  );
}
