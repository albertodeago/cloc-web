import { memo } from 'react';
import Head from 'next/head';

function AppHead() {
  return (
    <Head>
      <title>CLOC-web</title>
      <meta
        name="description"
        content="Count Lines Of Code of local projects directly on the web."
      ></meta>

      <meta name="og:title" property="og:title" content="CLOC-web"></meta>
      <meta
        property="og:description"
        content="Count Lines Of Code of local projects directly on the web."
      />
      <meta property="og:type" content="website"></meta>

      {/* Inject a script to avoid theme flashing when user saved dark theme as its preference */}
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
            var theme = localStorage.getItem("theme");
            if (theme !== "light" && theme !== "dark") {
              theme = undefined;
            }
            if (theme) {
              document.documentElement.setAttribute("data-theme", theme);
            }
            `,
        }}
      ></script>
    </Head>
  );
}

const MemoizedHead = memo(AppHead);

export { MemoizedHead as Head };
