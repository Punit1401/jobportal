import ModuleCrudPage from "@/components/admin/ModuleCrudPage";
import { moduleConfigs } from "@/components/admin/moduleConfigs";

export default function Page() {
  const config = moduleConfigs["social-media-integration"];

  return (
    <ModuleCrudPage
      moduleKey="social-media-integration"
      title={config.title}
      subtitle={config.subtitle}
      fields={config.fields}
      columns={config.columns}
    />
  );
}
