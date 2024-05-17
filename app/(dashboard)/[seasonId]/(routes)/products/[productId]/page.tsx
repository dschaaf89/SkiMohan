import prismadb from "@/lib/prismadb";

import { ProductForm } from "./components/product-form";

const ProductPage = async ({
  params
}: {
  params: { productId: string, seasonId: string }
}) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
    }
  });

  const programs = await prismadb.program.findMany({
    where: {
      seasonId: params.seasonId,
    },
  });

  const types = await prismadb.type.findMany({
    where: {
      seasonId: params.seasonId,
    },
  });


  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm 
          programs={programs} 
          types={types}
          initialData={product}
        />
      </div>
    </div>
  );
}

export default ProductPage;