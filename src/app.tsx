import { Router } from "./router";
import { useEffect, useMemo, useState } from 'preact/hooks';


const TestComponent = ({ lastname, id }: { lastname?: string, id: string }) => {
  return (
    <>
      <p>Prezime: {lastname}</p>
      <div>Id: {id}</div>
    </>
  );
}

export function App() {

  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener("navigate", onLocationChange);
    return () => window.removeEventListener("navigate", onLocationChange);
  }, []);

  const t = useMemo(() => Router({
    currentRoute: currentRoute,
    routerPatterns: [
      {
        routerPattern: '/marko/[lastname]/[id?]',
        renderComponent: (params) => <TestComponent lastname={params.lastname} id={params.id ?? 'nema id'} />
      }
    ]
  }), [currentRoute]);

  return (
    <>
      <p>Bok, ovo je moj router :)</p>
      <div className='bg-blue-200'>
        {t.Router}
      </div>
    </>
  )
}
