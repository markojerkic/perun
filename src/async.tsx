import { useCallback } from "preact/hooks";
import { routes } from "./app";

export const AsyncComponent = (props: {route: string}) => {

  const toPerson = useCallback(() => {
    routes.value.lastNameId.routeTo({ lastname: 'jerkic' })
  }, []);
  return (
    <>
      <div className='bg-fuchsia-200'>
        <p>Async rute: {props.route}</p>
        <button className='bg-blue-300' onClick={() => toPerson()}>Idemo na osobu jerkic</button>
      </div>
    </>
  );
}
