import ModuleCrudPage from "@/components/admin/ModuleCrudPage";
import { moduleConfigs } from "@/components/admin/moduleConfigs";

export default function Page() {
  const config = moduleConfigs["contact-developer"];

  return (
    <ModuleCrudPage
      moduleKey="contact-developer"
      title={config.title}
      subtitle={config.subtitle}
      fields={config.fields}
      columns={config.columns}
    />
  );
}
