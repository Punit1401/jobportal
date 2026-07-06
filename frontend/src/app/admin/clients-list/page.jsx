import ModuleCrudPage from "@/components/admin/ModuleCrudPage";
import { moduleConfigs } from "@/components/admin/moduleConfigs";

export default function Page() {
  const config = moduleConfigs["clients-list"];

  return (
    <ModuleCrudPage
      moduleKey="clients-list"
      title={config.title}
      subtitle={config.subtitle}
      fields={config.fields}
      columns={config.columns}
    />
  );
}
