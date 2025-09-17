// src/pages/products/[id].jsx

export { default } from "./ProductDetails";

// Pre-render known product detail pages (SSG) and revalidate daily (ISR)
export async function getStaticPaths() {
  return {
    paths: [
      { params: { id: "passenger" } },
      { params: { id: "hospital" } },
      { params: { id: "hydraulic" } },
      { params: { id: "goods" } },
      { params: { id: "rauli" } },
    ],
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const id = params?.id || null;
  return { props: { id }, revalidate: 86400 };
}
