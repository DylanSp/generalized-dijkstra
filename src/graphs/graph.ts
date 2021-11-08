import {
  Edge,
  EdgeBlueprint,
  incrementEdgeID,
  isoEdgeID,
  Vertex,
  VertexID,
} from "./types";

interface Graph<WeightDimensions extends number> {
  vertices: Array<Vertex>;
  edges: Array<Edge<WeightDimensions>>;
}

export const createGraph = <WeightDimensions extends number>(
  vertices: Array<VertexID>,
  edges: Array<EdgeBlueprint<WeightDimensions>>
): Graph<WeightDimensions> => {
  // consistency check
  for (const edgeBlueprint of edges) {
    console.log(
      `vertex1: ${edgeBlueprint.vertex1}, vertex2: ${edgeBlueprint.vertex2}`
    );
    if (!vertices.includes(edgeBlueprint.vertex1)) {
      throw new Error(
        `Vertex ${edgeBlueprint.vertex1} is not in the provided array of vertices`
      );
    }

    if (!vertices.includes(edgeBlueprint.vertex2)) {
      throw new Error(
        `Vertex ${edgeBlueprint.vertex2} is not in the provided array of vertices`
      );
    }
  }

  const graph: Graph<WeightDimensions> = {
    vertices: vertices.map((vertexID) => ({ id: vertexID })),
    edges: [],
  };

  let edgeID = isoEdgeID.wrap(0);
  for (const edgeBlueprint of edges) {
    const newEdge: Edge<WeightDimensions> = {
      id: edgeID,
      ...edgeBlueprint,
    };
    graph.edges.push(newEdge);
    edgeID = incrementEdgeID(edgeID);
  }

  return graph;
};
