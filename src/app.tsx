import { Router } from "./router";
import { useEffect, useMemo, useState } from 'preact/hooks';


const TestComponent = ({ lastname, id }: { lastname?: string, id: string }) => {
  return (
    <>
      <div className='bg-blue-200'>
        <p>Prezime: {lastname}</p>
        <div>Id: {id}</div>
      </div>
    </>
  );
}


const TestComponent2 = ({ country, player }: { country: string, player: string }) => {
  return (
    <>
      <div className='bg-red-200'>
        <p>Zemlja: {country}</p>
        <div>Igrač: {player}</div>
      </div>
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
    routerPatterns: {
      lastNameId: {
        routerPattern: '/marko/[lastname]/[id?]',
        renderComponent: (params) => <TestComponent lastname={params.lastname} id={params.id ?? 'nema id'} />
      },
      countryPlayer: {
        routerPattern: '/players/[country]/[player]',
        renderComponent: (params) => <TestComponent2 country={params.country} player={params.player} />
      }
    }
  }), [currentRoute]);

  return (
    <>
      <p>Bok, ovo je moj router :)</p>
      {t.Router}
    </>
  )
}
