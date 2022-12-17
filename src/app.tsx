import { Router } from "./router";
import { useState } from 'preact/hooks';

const TestComponent = (props: { lang?: string | number, id: string | number }) => {
  return (
    <>
      <p>hejjja, {props.lang}</p>
      <div>{props.id}</div>
    </>
  );
}

export function App() {
  const [currentRoute] = useState(window.location.href);
  const [route] = useState('/[lang?]/items/[id]');

  return (
    <>
      <Router routes={[{
        path: route,
        render: (props) => <TestComponent lang={props.lang} id={props.id} />
      }]} currentRoute={currentRoute} />
    </>
  )
}
