import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";
import { ProductsClient } from "./components/client";
import { ProductColumn } from "./components/columns";

const ProductsPage = async ({ params }: { params: { seasonId: string } }) => {
  const products = await prismadb.product.findMany({
    include: {
      program: true,
      type: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Debugging: Log the products to ensure correct data fetching
  console.log("Fetched Products:", products);

  const formattedProducts: ProductColumn[] = products.map((item) => {
    const price = item.price.toNumber();
    const formattedPrice = formatter.format(price);

    // Debugging: Log each formatted product
    console.log("Formatted Product:", {
      id: item.id,
      title: item.title,
      name: item.name,
      isFeatured: item.isFeatured,
      isArchived: item.isArchived,
      price: formattedPrice,
      program: item.program.name,
      type: item.type.name,
      quantity: item.quantity, // Add quantity here
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    });

    return {
      id: item.id,
      title:item.title,
      name: item.name,
      isFeatured: item.isFeatured,
      isArchived: item.isArchived,
      price: formattedPrice,
      program: item.program.name,
      type: item.type.name,
      quantity: item.quantity, // Include quantity in the returned object
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    };
  });

  // Debugging: Serialize the data to JSON to ensure no non-serializable objects
  const serializedProducts = JSON.parse(JSON.stringify(formattedProducts));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductsClient data={serializedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;
