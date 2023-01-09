import {
  createAsyncRoute,
  createRoute,
  createRouter,
} from "perun";
import { useCallback } from "preact/hooks";
import { z } from "zod";

const TestComponent = ({ lastname, id }: { lastname?: string; id: string }) => {
  return (
    <>
      <div className="bg-blue-200">
        <p>Prezime: {lastname}</p>
        <div>Id: {id}</div>
      </div>
    </>
  );
};

const TestComponent2 = ({
  country,
  player,
  queryParams,
}: {
  country: string;
  player: string;
  queryParams:
    | {
        ime: string;
        prezime?: string;
      }
    | undefined;
}) => {
  const toPerson = useCallback(() => {
    routes.lastNameId.routeTo({ lastname: "jerkic" });
  }, []);
  return (
    <>
      <div className="bg-red-200">
        <p>Zemlja: {country}</p>
        <div>Igrač: {player}</div>
        <div>Query params: {JSON.stringify(queryParams)}</div>
        <button className="bg-blue-300" onClick={() => toPerson()}>
          Idemo na osobu jerkic
        </button>
      </div>
    </>
  );
};

export const routes = {
  plyersCountry: createRoute({
    routePattern: "/players/[country]/[playername]",
    renderComponent: (props) => (
      <TestComponent2
        country={props.country}
        player={props.playername}
        queryParams={props.queryParams}
      />
    ),
    searchParamsValidator: z.object({
      ime: z.string(),
      prezime: z.string().optional(),
    }),
  }),

  lastNameId: createRoute({
    routePattern: "/[id?]/ime/[lastname]",
    renderComponent: (props) => (
      <TestComponent lastname={props.lastname} id={props.id ?? "name id"} />
    ),
    searchParamsValidator: z.object({}),
  }),

  asyncRoute: createAsyncRoute({
    routePattern: "/async/[route]",
    renderComponent: (props) =>
      import("./async").then((module) => (
        <module.AsyncComponent route={props.route} />
      )),
    searchParamsValidator: z.object({}),
  }),
};

const NoRoutesMatch = () => {
  return <div>404, requested route is not defined :(</div>;
};

export const App = () => {
  const router = createRouter({
    routes,
    noRoutesMatch: NoRoutesMatch,
  });

  const toPersonWithId = useCallback(() => {
    routes.lastNameId.routeTo({ id: "marko", lastname: "jerkic" });
  }, []);

  const toPerson = useCallback(() => {
    routes.lastNameId.routeTo({ lastname: "jerkic" });
  }, []);

  const toPlayer = useCallback(() => {
    routes.plyersCountry.routeTo({
      playername: "stipe",
      country: "hrv",
      queryParams: { ime: "marko" },
    });
  }, []);

  const toAsyncRoute = useCallback(() => {
    routes.asyncRoute.routeTo({ route: "neka" });
  }, []);

  return (
    <>
      <p>Bok, ovo je moj router :)</p>
      <div class="flex space-x-4 my-4">
        <routes.lastNameId.Link routeParams={{ lastname: "marko" }}>
          Na igrač marko ajde
        </routes.lastNameId.Link>
        <button className="bg-red-300" onClick={() => toPlayer()}>
          Idemo na igrač stipe iz hrv
        </button>
        <button className="bg-blue-300" onClick={() => toPerson()}>
          Idemo na osobu jerkic
        </button>
        <button className="bg-blue-300" onClick={() => toPersonWithId()}>
          Idemo na osobu jerkic s identifikatorom
        </button>
        <button className="bg-fuchsia-300" onClick={() => toAsyncRoute()}>
          Idemo na async rutu
        </button>
      </div>
      <router.Router />
    </>
  );
};
