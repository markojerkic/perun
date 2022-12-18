import { createRoute, createRouter } from "./router";
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


  const t = useMemo(() => createRouter({
    plyersCountry: createRoute({
      routePattern: '/[id?]/ime/[lastname]',
      renderComponent: (props) => <TestComponent lastname={props.lastname} id={props.id ?? 'name id'} />
    }),
    lastNameId: createRoute({
      routePattern: '/players/[countr]/[playername]',
      renderComponent: (props) => <TestComponent2 country={props.countr} player={props.playername} />,
    }),

  }), [currentRoute]);

  return (
    <>
      <p>Bok, ovo je moj router :)</p>
      {t}
    </>
  )
}
