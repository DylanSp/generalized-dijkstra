import { filter } from "fp-ts/lib/Set";
import { Connection, findNeighbors, Graph } from "./graph";
import { VertexID } from "./types";

export type Path = Array<VertexID>;

// TODO - if used in generalized Dijkstra, add WeightDimensions type parameter, make totalDistance a Tuple<number, WeightDimensions>
interface HopFromSource {
  previousVertex?: VertexID;
  totalDistance: number;
}

// taken from https://en.wikipedia.org/wiki/Dijkstra's_algorithm#Pseudocode
// TODO - currently finds *one* path, not all such paths
export const textbookDijkstra = (
  graph: Graph<1>,
  startVertex: VertexID,
  endVertex: VertexID
): Path => {
  if (graph.vertices.length === 0) {
    throw new Error("No vertices exist");
  }

  if (
    graph.vertices.find((vertex) => vertex.id === startVertex) === undefined
  ) {
    throw new Error(`Starting vertex ${startVertex} not in graph`);
  }

  if (graph.vertices.find((vertex) => vertex.id === endVertex) === undefined) {
    throw new Error(`Ending vertex ${endVertex} not in graph`);
  }

  // TODO - only necessary because we're constructing general map of distances
  // TODO - if we don't need that, use startVertex instead
  const initialVertex = graph.vertices[0];

  const unvisitedVertices = new Set<VertexID>(
    graph.vertices.map((vertex) => vertex.id)
  );
  const tentativeDistances = new Map<VertexID, HopFromSource>();
  tentativeDistances.set(initialVertex.id, {
    totalDistance: 0,
  });
  for (let i = 1; i < graph.vertices.length; i++) {
    tentativeDistances.set(graph.vertices[i].id, {
      totalDistance: Number.MAX_SAFE_INTEGER,
    });
  }

  let currentVertex = initialVertex.id;
  while (unvisitedVertices.size > 0) {
    const currentDistance =
      tentativeDistances.get(currentVertex)!.totalDistance;
    const connections = findNeighbors(graph, currentVertex);
    const unvisitedConnections = filter<Connection<1>>((connection) =>
      unvisitedVertices.has(connection.otherVertex)
    )(connections);
    for (const connection of unvisitedConnections) {
      const distanceThroughCurrent = currentDistance + connection.weight[0];
      if (
        distanceThroughCurrent <
        tentativeDistances.get(connection.otherVertex)!.totalDistance
      ) {
        tentativeDistances.set(connection.otherVertex, {
          totalDistance: distanceThroughCurrent,
          previousVertex: currentVertex,
        });
      }
    }
    unvisitedVertices.delete(currentVertex);

    const remainingVerticesByWeight = [...unvisitedVertices].sort(
      (vertex1, vertex2) => {
        const vertex1Distance = tentativeDistances.get(vertex1)!.totalDistance;
        const vertex2Distance = tentativeDistances.get(vertex2)!.totalDistance;
        return vertex1Distance - vertex2Distance;
      }
    );
    if (remainingVerticesByWeight.length !== 0) {
      currentVertex = remainingVerticesByWeight[0];
    }
  }

  const path: Path = [];
  let reverseTraversalCurrentNode = endVertex;
  while (reverseTraversalCurrentNode !== startVertex) {
    path.unshift(reverseTraversalCurrentNode);
    const previousNode = tentativeDistances.get(reverseTraversalCurrentNode)!;
    if (
      previousNode.previousVertex === undefined &&
      reverseTraversalCurrentNode !== startVertex
    ) {
      throw new Error(
        `No path from starting vertex ${startVertex} to ending vertex ${endVertex}`
      );
    }
    reverseTraversalCurrentNode = previousNode.previousVertex!;
  }
  path.unshift(startVertex);

  return path;
};

// taken from https://www.baeldung.com/cs/simple-paths-between-two-vertices#2-implementation
export const findAllPaths = <WeightDimensions extends number>(
  graph: Graph<WeightDimensions>,
  startVertex: VertexID,
  endVertex: VertexID
): Set<Path> => {
  const allPaths = new Set<Path>();
  const visitedVertices = new Set<VertexID>();
  let currentPath: Path = [];

  const depthFirstTraversal = (startVertex: VertexID, endVertex: VertexID) => {
    if (visitedVertices.has(startVertex)) {
      return;
    }

    visitedVertices.add(startVertex);
    currentPath.push(startVertex);
    if (startVertex === endVertex) {
      allPaths.add(currentPath.slice()); // store currentPath's current value, while allowing future modifications to currentPath
      visitedVertices.delete(startVertex);
      currentPath = currentPath.slice(0, -1);
      return;
    }

    const connections = findNeighbors(graph, startVertex);
    for (const connection of connections) {
      depthFirstTraversal(connection.otherVertex, endVertex);
    }

    currentPath = currentPath.slice(0, -1);
    visitedVertices.delete(startVertex);
  };

  depthFirstTraversal(startVertex, endVertex);
  return allPaths;
};
