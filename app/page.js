export default function Home() {
  const env = process.env.DATABASE_URL_1;
  console.log(env, "/n");
  return <h1>Nk store backend</h1>;
}
