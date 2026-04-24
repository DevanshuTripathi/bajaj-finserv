const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json()); 

app.post('/bfhl', (req, res) => {
    const rawData = req.body.data || [];
    const invalid_entries = [];
    const duplicate_edges = [];
    const seenEdges = new Set();
    const firstParentMap = {};
    const adjacencyList = {};
    const allNodes = new Set();
    const childrenNodes = new Set();

    rawData.forEach(item => {
        const trimmed = item.trim();
        
        if (!/^[A-Z]->[A-Z]$/.test(trimmed)) {
            invalid_entries.push(item);
            return;
        }

        const [parent, child] = trimmed.split('->');
        if (parent === child) {
            invalid_entries.push(item);
            return;
        }

        if (seenEdges.has(trimmed)) {
            if (!duplicate_edges.includes(trimmed)) {
                duplicate_edges.push(trimmed);
            }
            return;
        }
        seenEdges.add(trimmed);

        if (firstParentMap[child] && firstParentMap[child] !== parent) {
            return;
        }
        firstParentMap[child] = parent;

        if (!adjacencyList[parent]) adjacencyList[parent] = [];
        adjacencyList[parent].push(child);
        allNodes.add(parent);
        allNodes.add(child);
        childrenNodes.add(child);
    });

    if (allNodes.size === 0) {
        return res.json({
            user_id: "devanshutripathi_16122005",
            email_id: "dt4025@srmist.edu.in",
            college_roll_number: "RA2311056010323",
            hierarchies: [],
            invalid_entries,
            duplicate_edges,
            summary: {
                total_trees: 0,
                total_cycles: 0,
                largest_tree_root: null
            }
        });
    }

    let roots = [...allNodes].filter(n => !childrenNodes.has(n));

    let allTreesToProcess = [];

    if (roots.length > 0) {
        allTreesToProcess = roots.sort();
    } else {
        const smallestNode = [...allNodes].sort()[0];
        allTreesToProcess = [smallestNode];
    }

    
    const hierarchies = [];
    let total_trees = 0;
    let total_cycles = 0;
    let max_depth = 0;
    let largest_tree_root = "";

    allTreesToProcess.forEach(rootNode => {
        const visitedStack = new Set();
        let hasCycle = false;

        function buildTree(node, depth) {
            if (visitedStack.has(node)) {
                hasCycle = true;
                return {};
            }
            visitedStack.add(node);
            const children = adjacencyList[node] || [];
            const treeObj = {};
            let maxChildDepth = depth;

            children.forEach(child => {
                const result = buildTree(child, depth + 1);
                treeObj[child] = result.treePart;
                maxChildDepth = Math.max(maxChildDepth, result.maxDepth);
            });

            visitedStack.delete(node);
            return { treePart: treeObj, maxDepth: maxChildDepth };
        }

        const traversal = buildTree(rootNode, 1);
        
        const hierarchyObj = { root: rootNode };
        
        if (hasCycle) {
            hierarchyObj.has_cycle = true;
            hierarchyObj.tree = {};
            total_cycles++;
        } else {
            hierarchyObj.tree = { [rootNode]: traversal.treePart };
            hierarchyObj.depth = traversal.maxDepth;
            total_trees++;

            if (traversal.maxDepth > max_depth) {
                max_depth = traversal.maxDepth;
                largest_tree_root = rootNode;
            } else if (traversal.maxDepth === max_depth && max_depth > 0) {
                if (rootNode < largest_tree_root) {
                    largest_tree_root = rootNode;
                }
            }
        }
        hierarchies.push(hierarchyObj);
    });

    res.json({
        "user_id": "devanshutripathi_16122005",
        "email_id": "dt4025@srmist.edu.in",
        "college_roll_number": "RA2311056010323",
        "hierarchies": hierarchies,
        "invalid_entries": invalid_entries,
        "duplicate_edges": duplicate_edges,
        "summary": {
            "total_trees": total_trees,
            "total_cycles": total_cycles,
            "largest_tree_root": largest_tree_root || null
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));