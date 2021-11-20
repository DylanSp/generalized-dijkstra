import * as fc from "fast-check";
import { createGraph, Graph } from "./graph";
import { findAllPaths, textbookDijkstra } from "./search";
import { vertexIDIso, Vertex, VertexID, EdgeBlueprint } from "./types";

/*
class ArbitraryGraph<WeightDimensions extends number> extends NextArbitrary<Graph<WeightDimensions>> {
  generate(mrng: fc.Random, biasFactor: number | undefined): fc.NextValue<Graph<WeightDimensions>> {
    throw new Error("Method not implemented.");
  }
  canShrinkWithoutContext(value: unknown): value is Graph<WeightDimensions> {
    throw new Error("Method not implemented.");
  }
  shrink(value: Graph<WeightDimensions>, context: unknown): fc.Stream<fc.NextValue<Graph<WeightDimensions>>> {
    throw new Error("Method not implemented.");
  }
}

class ArbitraryGraph1D extends ArbitraryGraph<1> {
};
*/

const arbitraryVertexes: fc.Arbitrary<Array<VertexID>> = fc.array(
  fc.nat().map((num) => vertexIDIso.wrap(num))
);
const arbitraryBooleanStream = fc.infiniteStream(fc.boolean());
const arbitraryWeightStream = fc.infiniteStream(fc.nat());

const arbitraryGraph1D: fc.Arbitrary<Graph<1>> = fc
  .tuple(arbitraryVertexes, arbitraryBooleanStream, arbitraryWeightStream)
  .map(([vertexList, boolStream, weightStream]) => {
    const edgeBlueprints: Array<EdgeBlueprint<1>> = [];

    for (let i = 0; i < vertexList.length; i++) {
      for (let j = i + 1; j < vertexList.length; j++) {
        // casts should always succeed because boolStream, weightStream are infinite
        if ((boolStream.next() as IteratorYieldResult<boolean>).value) {
          edgeBlueprints.push({
            vertex1: vertexList[i],
            vertex2: vertexList[j],
            weight: [
              (weightStream.next() as IteratorYieldResult<number>).value,
            ],
          });
        }
      }
    }

    return createGraph(vertexList, edgeBlueprints);
  });

describe("Graph path search algorithms", () => {
  describe("Finding all paths", () => {
    it("Two possible paths", () => {
      // Arrange
      const startVertex: Vertex = {
        id: vertexIDIso.wrap(1),
      };

      const intermediateVertex1: Vertex = {
        id: vertexIDIso.wrap(2),
      };

      const intermediateVertex2: Vertex = {
        id: vertexIDIso.wrap(3),
      };

      const endVertex: Vertex = {
        id: vertexIDIso.wrap(4),
      };

      const edge12: EdgeBlueprint<0> = {
        vertex1: startVertex.id,
        vertex2: intermediateVertex1.id,
        weight: [],
      };

      const edge13: EdgeBlueprint<0> = {
        vertex1: startVertex.id,
        vertex2: intermediateVertex2.id,
        weight: [],
      };

      const edge24: EdgeBlueprint<0> = {
        vertex1: intermediateVertex1.id,
        vertex2: endVertex.id,
        weight: [],
      };

      const edge34: EdgeBlueprint<0> = {
        vertex1: intermediateVertex2.id,
        vertex2: endVertex.id,
        weight: [],
      };

      const graph = createGraph(
        [
          startVertex.id,
          intermediateVertex1.id,
          intermediateVertex2.id,
          endVertex.id,
        ],
        [edge12, edge13, edge24, edge34]
      );

      // Act
      const allPaths = findAllPaths(graph, startVertex.id, endVertex.id);

      // Assert
      expect(allPaths.size).toBe(2);

      // path through intermediateVertex1
      expect(Array.from(allPaths)).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([
            expect.objectContaining({
              vertex1: startVertex.id,
              vertex2: intermediateVertex1.id,
            }),
            expect.objectContaining({
              vertex1: intermediateVertex1.id,
              vertex2: endVertex.id,
            }),
          ]),
        ])
      );

      // path through intermediateVertex1
      expect(Array.from(allPaths)).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([
            expect.objectContaining({
              vertex1: startVertex.id,
              vertex2: intermediateVertex2.id,
            }),
            expect.objectContaining({
              vertex1: intermediateVertex2.id,
              vertex2: endVertex.id,
            }),
          ]),
        ])
      );
    });
  });

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
      expect(path).toHaveLength(1);
      expect(path[0]).toEqual(
        expect.objectContaining({
          vertex1: vertex1.id,
          vertex2: vertex2.id,
        })
      );
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
      expect(path).toHaveLength(2);
      expect(path[0]).toEqual(
        expect.objectContaining({
          vertex1: vertex1.id,
          vertex2: vertex2.id,
        })
      );
      expect(path[1]).toEqual(
        expect.objectContaining({
          vertex1: vertex2.id,
          vertex2: vertex3.id,
        })
      );
    });

    it.skip("Nontrivial example with multiple possible paths", () => {
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
      expect(path).toHaveLength(2);
      expect(path[0]).toEqual(
        expect.objectContaining({
          vertex1: startVertex.id,
          vertex2: cheapIntermediateVertex.id,
        })
      );
      expect(path[1]).toEqual(
        expect.objectContaining({
          vertex1: cheapIntermediateVertex.id,
          vertex2: endVertex.id,
        })
      );
    });

    // it("Property-based test; out of all paths");
  });
});

export {};
