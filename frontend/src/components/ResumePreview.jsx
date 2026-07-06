import Template1 from "@/app/template/template1";
import Template2 from "@/app/template/template2";
import Template3 from "@/app/template/template3";
import Template4 from "@/app/template/template4";

export default function ResumePreview({ data, selected }) {
  return (
    <div className="bg-white p-6 shadow rounded h-full overflow-auto">

      {selected === "template1" && <Template1 data={data} />}
      {selected === "template2" && <Template2 data={data} />}
      {selected === "template3" && <Template3 data={data} />}
      {selected === "template4" && <Template4 data={data} />}
      

    </div>
  );
}
