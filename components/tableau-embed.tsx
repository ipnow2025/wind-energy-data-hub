"use client"

import { useEffect, useRef } from "react"

export default function TableauEmbed() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const vizId = "viz1761894259730"

    const divElement = document.getElementById(vizId)
    if (!divElement) return

    const vizElement = divElement.getElementsByTagName("object")[0]
    if (!vizElement) return

    if (divElement.offsetWidth > 800) {
      vizElement.style.width = "1400px"
      vizElement.style.height = "927px"
    } else if (divElement.offsetWidth > 500) {
      vizElement.style.width = "1400px"
      vizElement.style.height = "927px"
    } else {
      vizElement.style.width = "100%"
      vizElement.style.height = "2727px"
    }

    const scriptElement = document.createElement("script")
    scriptElement.type = "text/javascript"
    scriptElement.src = "https://public.tableau.com/javascripts/api/viz_v1.js"
    vizElement.parentNode?.insertBefore(scriptElement, vizElement)
  }, [])

  return (
    <div className="w-full" ref={containerRef}>
      <div className="tableauPlaceholder" id="viz1761894259730" style={{ position: "relative" }}>
        <noscript>
          <a href="#">
            <img
              alt=" "
              src="/images/design-mode/1_rss(1).png"
              style={{ border: "none" }}
            />
          </a>
        </noscript>
        <object className="tableauViz" style={{ display: "none" }}>
          <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
          <param name="embed_code_version" value="3" />
          <param name="site_root" value="" />
          <param name="name" value="_17609441724260&#47;1" />
          <param name="tabs" value="no" />
          <param name="toolbar" value="yes" />
          <param name="static_image" value="https://public.tableau.com/static/images/_1/_17609441724260/1/1.png" />
          <param name="animate_transition" value="yes" />
          <param name="display_static_image" value="yes" />
          <param name="display_spinner" value="yes" />
          <param name="display_overlay" value="yes" />
          <param name="display_count" value="yes" />
          <param name="language" value="en-US" />
        </object>
      </div>
    </div>
  )
}
