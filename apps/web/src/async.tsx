import { routes } from "./app";

export const AsyncComponent = (props: { route: string }) => {

  return (
    <>
      <div className="bg-fuchsia-200">
        <p>Async rute: {props.route}</p>
        <routes.lastNameId.Link routeParams={{ lastname: "jerkić" }}>
          <div className="bg-blue-300">Idemo na osobu jerkic</div>
        </routes.lastNameId.Link>
      </div>
    </>
  );
};
