# 0002: Router Implementation using Prefix Tree 🌳

## Status

✅ Accepted

## 🤔 Context

Modern web frameworks require an efficient mechanism to map incoming request URL pathnames to their corresponding handlers or resources. Key requirements for this routing system include:

1.  **Pattern Matching:** Support for exact static paths (e.g., `/about`), paths with dynamic parameters (e.g., `/users/:userId`), and catch-all parameters for matching path suffixes (e.g., `/files/*filepath`).
2.  **Performance:** Efficient lookups, especially when dealing with a large number of routes, many of which might share common prefixes. Simple linear scanning of potential routes does not scale well.
3.  **Features:** Ability to associate handlers/metadata with specific routes, differentiate routes based on HTTP methods (GET, POST, etc.), and extract values captured by dynamic or catch-all parameters.

## 🎯 Decision

We chose to implement the router using a **prefix tree**, specifically a variant known as a **Radix Tree**. This structure efficiently organizes routes by shared path prefixes, optimizing lookup speed and handling dynamic parameters effectively.

### Core Data Structure

- **Method Trees:** The router uses a `Map` to store a separate Radix Tree for each HTTP method (GET, POST, etc.).
- **Nodes:** Each tree is composed of `Node` objects. The path from the root to any node represents a common prefix for one or more routes. Nodes store a `fragment` (the path part they represent), their `type` (`static`, `dynamic`, `catch-all`), potential parameter `name`, child nodes, and optionally the route `data` if they mark the end of a pattern.
- **Radix Optimization:** Nodes representing `static` fragments may only contain _part_ of a path segment to maximize prefix sharing (e.g., `/hello` and `/helloworld` might share a node with `fragment: "hello"`). Nodes are split as needed during insertion to maintain this structure.

### Key Operations

- **Adding Routes (`addRoute`):**

  - Traverses the appropriate method tree based on the route pattern.
  - Matches the pattern against node `fragment`s, splitting existing nodes when necessary to accommodate new routes sharing a common prefix (Radix Tree property).
  - Creates new nodes (`static`, `dynamic`, or `catch-all`) for the remaining parts of the pattern.
  - Validates patterns (e.g., catch-all must be terminal) and stores the associated `data` on the final node for the pattern.

- **Matching Routes (`findRoute`):**
  - Traverses the appropriate method tree based on the incoming request `pathname`.
  - Matches the `pathname` segments against node `fragment`s.
  - Prioritizes matches in the order: static children, dynamic child, catch-all child.
  - When matching `dynamic` or `catch-all` nodes, extracts the corresponding values from the `pathname` and stores them in a parameters map.
  - If a chosen path (e.g., down a static or dynamic branch) doesn't lead to a valid route match, the search backtracks to try the next prioritized option (e.g., checking dynamic after static fails, or catch-all after dynamic fails).
  - Returns the associated `data` and extracted parameters upon a successful match, or `null` otherwise.

## ⚖️ Consequences

Choosing a Radix Tree structure for the router leads to the following outcomes:

- **Advantages 👍:**

  - **Lookup Performance:** Matching request pathnames is highly efficient (approaching O(k), where k is the path length), significantly faster than linear scans for large route sets, thanks to the prefix-sharing nature of the Radix Tree. This directly addresses the performance requirement from the context.
  - **Effective Pattern Support:** Handles static paths, dynamic parameters (`:param`), and catch-all parameters (`*param`) as required, meeting the pattern matching needs.
  - **Integrated Parameter Extraction:** The tree traversal mechanism naturally extracts values for dynamic and catch-all parameters during the lookup process.
  - **Method Isolation:** Separating routes by HTTP method into distinct trees provides clear organization.

- **Disadvantages 👎:**

  - **Implementation Complexity:** The logic for inserting routes, particularly handling node splits and prefix management inherent to Radix Trees, is more complex than simpler list-based routing approaches.
  - **Memory Footprint:** While prefix sharing reduces redundancy compared to storing full paths repeatedly, the tree structure itself (nodes, children pointers, fragments) can consume more memory than a flat list, especially for very diverse, non-overlapping routes.

- **Neutral Considerations 👀:**
  - The actual real-world performance gain compared to other methods depends heavily on the specific structure, quantity, and degree of overlap among the registered routes.
