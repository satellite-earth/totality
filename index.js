
module.exports = function Totality(links = [], params = {}) {

	const maxDegrees = params.maxDegrees || 6;
	let population, lambda;
	let s = 0;

	const node = {};
	const tree = {};
	const rank = {};

	// Build mapping of each node to its direct sources
	for (let link of links) {
		if (typeof node[link.target] === 'undefined') {
			node[link.target] = [ link.source ];
		} else if (node[link.target].indexOf(link.source) === -1) {
			node[link.target].push(link.source);
		}
	}

	const recurse = (target, sources, degrees = 0) => {

		for (let source of sources) {

			// If source is not same as the target, within max
			// degrees, and has not been previously detected
			// at a lower degree of separation, proceed
			if (
				source !== target
				&& degrees <= maxDegrees
				&& ( typeof tree[target] === 'undefined'
				|| typeof tree[target][source] === 'undefined'
				|| tree[target][source] > degrees )
			) {

				// Get the source's sources 
				const sub = node[source];

				// Record the source if the source has at
				// least one source itself
				if (sub) {

					// Init mapping as necessary
					if (typeof tree[target] === 'undefined') {
						tree[target] = {};
					}

					// Record the degree of separation
					tree[target][source] = degrees;

					// Loop through the list of sources
					recurse(target, sub, degrees + 1);
				}
			}
		}
	};

	population = Object.keys(node);

	// Find minimum degree of separation for each
	// source and increment the sources which are
	// themselves targeted by one or more nodes.
	for (let id of population) {
		const sources = node[id];
		recurse(id, sources);
		s += sources.filter(_id => {
			return node[_id] && _id !== id;
		}).length;
	}

	// Lambda is equal to the average number of
	// sources which are themselves targeted
	// by at least one other node, per node
	lambda = s / population.length;

	// Iterate across targeted nodes
	for (let id of Object.keys(tree)) {

		// Init as necessary
		if (typeof rank[id] === 'undefined') {
			rank[id] = 0;
		}

		// Rank is incremented by the reciprocal of lambda raised
		// to the power of the source node's degree of separation
		for (let source of Object.keys(tree[id])) {
			rank[id] += 1 / Math.pow(lambda, tree[id][source]);
		}
	}

	return { node, tree, rank, lambda };
}
