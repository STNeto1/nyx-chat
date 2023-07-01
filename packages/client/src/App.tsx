import { env } from "./env";

function App() {
  return (
    <section className="container py-10">
      <h1>{env.VITE_APP_API_URL}</h1>
    </section>
  );
}

export default App;
