import React from "react";
import ReactDOMServer from "react-dom/server";

import template1 from "@/template/template1";
import template2 from "@/template/template2";
import template3 from "@/template/template3";
import template4 from "@/template/template4";

export const TEMPLATE_MAP = {
  template1: template1,
  template2: template2,
  template3: template3,
  template4: template4,
};

export function renderTemplateToHTML(template, data, accentColor = "#1E90FF") {
  const Component = TEMPLATE_MAP[template] || template1;

  const element = React.createElement(Component, { data, accentColor });

  return ReactDOMServer.renderToStaticMarkup(element);
}
