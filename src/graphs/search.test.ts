import { createGraph } from "./graph";
import { textbookDijkstra } from "./search";
import { vertexIDIso, Vertex, EdgeBlueprint } from "./types";

describe("Graph path search algorithms", () => {
  describe("Textbook Dijkstra's algorithm (1-dimension weights)", () => {
    it("Trivial example - two vertices, one edge", () => {
      // Arrange
      const vertex1: Vertex = {
        id: vertexIDIso.wrap(1),
      };
      const vertex2: Vertex = {
        id: vertexIDIso.wrap(2),
      };

      const edgeBlueprint: EdgeBlueprint<1> = {
        vertex1: vertex1.id,
        vertex2: vertex2.id,
        weight: [5],
      };

      const graph = createGraph([vertex1.id, vertex2.id], [edgeBlueprint]);

      // Act
      const path = textbookDijkstra(graph, vertex1.id, vertex2.id);

      // Assert
      expect(path).toHaveLength(2);
      expect(path[0]).toBe(vertex1.id);
      expect(path[1]).toBe(vertex2.id);
    });

    it("Slightly nontrivial example - three vertices, one possible path", () => {
      // Arrange
      const vertex1: Vertex = {
        id: vertexIDIso.wrap(1),
      };
      const vertex2: Vertex = {
        id: vertexIDIso.wrap(2),
      };
      const vertex3: Vertex = {
        id: vertexIDIso.wrap(3),
      };

      const edge12Blueprint: EdgeBlueprint<1> = {
        vertex1: vertex1.id,
        vertex2: vertex2.id,
        weight: [4],
      };
      const edge23Blueprint: EdgeBlueprint<1> = {
        vertex1: vertex2.id,
        vertex2: vertex3.id,
        weight: [5],
      };

      const graph = createGraph(
        [vertex1.id, vertex2.id, vertex3.id],
        [edge12Blueprint, edge23Blueprint]
      );

      // Act
      const path = textbookDijkstra(graph, vertex1.id, vertex3.id);

      // Assert
      expect(path).toHaveLength(3);
      expect(path[0]).toBe(vertex1.id);
      expect(path[1]).toBe(vertex2.id);
      expect(path[2]).toBe(vertex3.id);
    });

    it("Nontrivial example with multiple possible paths", () => {
      // Arrange
      const startVertex: Vertex = {
        id: vertexIDIso.wrap(1),
      };
      const expensiveIntermediateVertex: Vertex = {
        id: vertexIDIso.wrap(2),
      };
      const cheapIntermediateVertex: Vertex = {
        id: vertexIDIso.wrap(3),
      };
      const endVertex: Vertex = {
        id: vertexIDIso.wrap(4),
      };

      const edge12: EdgeBlueprint<1> = {
        vertex1: startVertex.id,
        vertex2: expensiveIntermediateVertex.id,
        weight: [5],
      };
      const edge13: EdgeBlueprint<1> = {
        vertex1: startVertex.id,
        vertex2: cheapIntermediateVertex.id,
        weight: [10],
      };
      const edge24: EdgeBlueprint<1> = {
        vertex1: expensiveIntermediateVertex.id,
        vertex2: endVertex.id,
        weight: [999],
      };
      const edge34: EdgeBlueprint<1> = {
        vertex1: cheapIntermediateVertex.id,
        vertex2: endVertex.id,
        weight: [1],
      };

      const graph = createGraph(
        [
          startVertex.id,
          cheapIntermediateVertex.id,
          expensiveIntermediateVertex.id,
          endVertex.id,
        ],
        [edge12, edge13, edge24, edge34]
      );

      // Act
      const path = textbookDijkstra(graph, startVertex.id, endVertex.id);

      // Assert

      // search should be "tempted" by lower cost to expensiveIntermediateVertex, but total cost is cheaper going through cheapIntermediateVertex
      expect(path).toHaveLength(3);
      expect(path[0]).toBe(startVertex.id);
      expect(path[1]).toBe(cheapIntermediateVertex.id);
      expect(path[2]).toBe(endVertex.id);
    });
  });
});

export {};
