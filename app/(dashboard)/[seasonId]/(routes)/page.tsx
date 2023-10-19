import prismadb from "@/lib/prismadb";

interface DashboardPageProps {
  params: {
    seasonId: string;
  };
};

const DashboardPage: React.FC<DashboardPageProps> = async ({ 
  params
}) => {
  const season = await prismadb.season.findFirst({
    where: {
      id: params.seasonId
    }
  });
  return (
    <div>
     Active season : {season?.name};
    </div>
  );
}


export default DashboardPage;