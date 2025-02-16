
const csvString = `BMI,Age,Truth
25,18,0
25,22,0
24,23,0
23,35,1
28,38,0
30,39,1
31,29,1
36,40,1`;

// Convert CSV to a 2D array
const data = csvString.split("\n").map(row => row.split(",").map(value => isNaN(value) ? value : Number(value)));


// Modifying the data.
n = data[0].length
let keys = data[0]
let mdata = data.map(row => 
    Object.fromEntries(keys.map((key, i) => [key, row[i]]))
);
mdata.shift();
// tree remembers path.
let tree = []
const gimp = (arr, lrnf) => {
  	let feature_best = [];
  
  	for (let i = 0; i < keys.length - 1; i++) {  // Excluding "Truth"
		let key = keys[i];

		// Clone & Sort Data
		let sortedArr = [...arr].sort((a, b) => a[key] - b[key]);

		// Extract key values & truth values
		let keyvalues = sortedArr.map(obj => [obj[key], obj["Truth"]]);
	  
		// Gini impurity calculation
		let feature_imp = [];

		for (let j = 0; j < keyvalues.length; j++) {
			let lczeroes = 0, lcones = 0, rczeroes = 0, rcones = 0;

			for (let k = 0; k <= j; k++) {
				keyvalues[k][1] === 0 ? lczeroes++ : lcones++;
			}
			for (let k = j + 1; k < keyvalues.length; k++) {
				keyvalues[k][1] === 0 ? rczeroes++ : rcones++;
			}

			// Avoid division by zero
			let lpzero = (lczeroes + lcones) ? lczeroes / (lcones + lczeroes) : 0;
			let lpone = (lczeroes + lcones) ? lcones / (lcones + lczeroes) : 0;
			let rpzero = (rczeroes + rcones) ? rczeroes / (rcones + rczeroes) : 0;
			let rpone = (rczeroes + rcones) ? rcones / (rcones + rczeroes) : 0;

			let split_impurity =
				(lczeroes + lcones) / keyvalues.length * (1 - lpzero * lpzero - lpone * lpone) +
				(rczeroes + rcones) / keyvalues.length * (1 - rpzero * rpzero - rpone * rpone);

			feature_imp.push([keyvalues[j][0], split_impurity]);
		}
		// Sort by impurity and take best split point
		feature_imp.sort((a, b) => a[1] - b[1]);
		let best_split = feature_imp[0];
		best_split.unshift(key); // Add feature name

		feature_best.push(best_split);
	  	feature_best.sort((a, b) => a[2] - b[2]);
	}
  	feature_best[0].pop();
  	let key = feature_best[0][0];
  	 // first crude prediction:
  	let truthAvg = mdata.reduce((sum, row) => sum + row["Truth"], 0) / mdata.length;
  	let pred=[];
  	for (let i=0; i<mdata.length; i++){
		pred[i]=truthAvg;
	}
  
  	let residuals = mdata.map((row, i) => row[keys[keys.length - 1]] - pred[i])
  	let clubbed = mdata.map((row, i) => [key, row[key], residuals[i]]);
  	let lavg=0, ravg=0, lcount=0, rcount=0;
  	for (let i =0; i<clubbed.length; i++){
		if (clubbed[i][1] <= feature_best[0][1]){
			lavg+= clubbed[i][2];
		  	lcount++;
		} else {
			ravg+= clubbed[i][2];
		  	rcount++;
		}
	}
  	lavg/=lcount;
  	ravg/=rcount;
 	for (let i =0; i<clubbed.length; i++){
		if (clubbed[i][1] <= feature_best[0][1]){
			pred[i]+=lavg*lrnf
		} else {
			pred[i]+=ravg*lrnf
		}
	}
  	tree.push([feature_best[0][0], feature_best[0][1], lrnf*lavg, lrnf*ravg]);
  	return pred;
};

// gboost is the gradient boosting calculator.
const gboost = (mdata, n, pred, lrnf) => {
  	// mdata is modified data, n is number of iterations for training, pred is a prediction after which you gradient boost,  and lrnf is the learning factor.
  	n--;
  	if (n<0){
		return pred;
	}
  	let residuals = mdata.map((row, i) => row[keys[keys.length - 1]] - pred[i]);
  	let feature_best=[];
  	for (let i = 0; i < keys.length - 1; i++){
		// this loop alters feature
	  	let feature_mse=[];
	  	let key = keys[i];
		let clubbed = mdata.map((row, i) => [key, row[key], residuals[i]]);
	  	clubbed.sort((a,b) => a[1]-b[1]);
	  	//scrib.show(clubbed);
	  	for (let j = 0; j < clubbed.length-1;j++){
			let lavg = 0, ravg=0, lmse=0, rmse=0, mse=0; 
		  	// mean square error calculation at each split.
		  
		  	for (let k = 0; k<= j; k++){
				lavg+=clubbed[k][2];
			}
		  	lavg/=(j+1);
		  
		  	for (let k = 0; k<= j; k++){
				lmse+=(clubbed[k][2] - lavg)**2;
			}
		  
		  	for (let k = j+1; k< clubbed.length; k++){
				ravg+=clubbed[k][2];
			}
		  	ravg/=(clubbed.length-j-1);
		  
		  	for (let k = j+1; k< clubbed.length; k++){
				rmse+=(clubbed[k][2] - ravg)**2;
			}
			// this prints at every split point of a feature
		  	mse = (lmse+rmse)/clubbed.length;
		  	feature_mse.push([key, clubbed[j][1], mse]);
		}
		feature_mse.sort((a,b) => a[2]-b[2]);
		feature_best.push(feature_mse[0]);
	  
	  	
	}
	feature_best.sort((a,b)=>a[2]-b[2]);
  	let sorter=feature_best[0] // this tells us what feature and which split point to filter on.
	
	// this is to calculate the corrections.
	let lavg=0, ravg=0, lcount=0, rcount=0;
  
	let clubbed = mdata.map((row, i) => [sorter[0], row[sorter[0]], residuals[i]]);
	for (let i=0; i<residuals.length; i++){
		if 	(clubbed[i][1]<=sorter[1]){
			lavg+=clubbed[i][2];
			lcount+=1;
		} else {
			ravg+=clubbed[i][2];
		  	rcount+=1;
		}
	}
  	
  	lavg/=lcount;
  	ravg/=rcount;
  
  	// this is to make the next prediction.
  	for (let i=0; i<residuals.length; i++){
		if 	(clubbed[i][1]<=sorter[1]){
			pred[i]+=lrnf*lavg
		} else {
			pred[i]+=lrnf*ravg
		}
	}
  	
  	// this is for memorizing the path. So we remember the decision tree.
  	tree.push([sorter[0], sorter[1], lrnf*lavg, lrnf*ravg])
  	return gboost(mdata, n, pred, lrnf)
};


const learn = (mdata, n, lrnf) => {
	return gboost(mdata, n, gimp(mdata, lrnf), lrnf)
}


const predict = (obj,mdata) => {
  	let initial= mdata.reduce((sum, row) => sum + row["Truth"], 0) / mdata.length;
	for (let i=0; i<tree.length; i++){
		obj[tree[i][0]] <= tree[i][1] ? initial += tree[i][2] : initial += tree[i][3];
	}
  	return initial;
}

scrib.show(learn(mdata, 100, 0.1));
scrib.show(Math.abs(predict({"BMI": 29, "Age":30},mdata).toFixed(2)))
