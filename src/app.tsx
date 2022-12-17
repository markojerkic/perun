import { Route } from "./router";

const TestComponent = (props: { lang?: string | number, id: string | number }) => {
  return (
    <>
      <p>hejjja, {props.lang}</p>
      <div>{props.id}</div>
    </>
  );
}

export function App() {
  const t = TestComponent;
  return (
    <>
      <Route path={'/[lang?]/items/[id]'} render={(props) => <TestComponent lang={props.lang} id={props.id} />} />
    </>
  )
}
