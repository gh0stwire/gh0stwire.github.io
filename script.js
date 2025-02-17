/*
const csvString = `BMI,Age,Truth
25,18,0
25,22,0
24,23,0
23,35,1
28,38,0
30,39,1
31,29,1
36,40,1`;
*/
// Convert CSV to a 2D array
const modify=() => {
  let csvString=document.querySelector("#csvString").value;
  const data = csvString.split("\n").map(row => row.split(",").map(value => isNaN(value) ? value : Number(value)));

  // Modifying the data.
  n = data[0].length
  let keys = data[0].map(key => key.trim());
  let mdata = data.map(row => 
      Object.fromEntries(keys.map((key, i) => [key, row[i]]))
  );
  mdata.shift();
  mdata = mdata.map(item => {
    let cleanedItem = {};
    for (let key in item) {
      cleanedItem[key.trim()] = item[key]; // Remove spaces around the key
    }
    return cleanedItem;
  });        
  return mdata;
}

const modifier = (strg) =>{
  const data = strg.split("\n").map(row => row.split(",").map(value => isNaN(value) ? value : Number(value)));
  n = data[0].length
  let keys = data[0].map(key => key.trim());
  let mdata = data.map(row => 
      Object.fromEntries(keys.map((key, i) => [key, row[i]]))
  );
  mdata.shift();
  mdata = mdata.map(item => {
    let cleanedItem = {};
    for (let key in item) {
      cleanedItem[key.trim()] = item[key]; // Remove spaces around the key
    }
    return cleanedItem;
  });        
  return mdata;
}


// tree remembers path.
let tree = []
const gimp = (arr, lrnf) => {
    let keys= Object.keys(arr[0]);
  	let feature_best = [];
  
  	for (let i = 0; i < keys.length - 1; i++) {  
		let key = keys[i];

		// Clone & Sort Data
		let sortedArr = [...arr].sort((a, b) => a[key] - b[key]);

		// Extract key values & truth values
		let keyvalues = sortedArr.map(obj => [obj[key], obj[keys[keys.length-1]]]);
	  
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
  	let truthAvg = arr.reduce((sum, row) => sum + row[keys[keys.length-1]], 0) / arr.length;
  	let pred=[];
  	for (let i=0; i<arr.length; i++){
		pred[i]=truthAvg;
	}
  
  	let residuals = arr.map((row, i) => row[keys[keys.length - 1]] - pred[i])
  	let clubbed = arr.map((row, i) => [key, row[key], residuals[i]]);
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
    let keys= Object.keys(mdata[0]);
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
    //console.log(clubbed[i], sorter)
		if 	(clubbed[i][1]<=sorter[1]){
      //console.log(`lavg: ${lavg}`)
      //console.log(`term to be added: ${clubbed[i][2]}`)
			lavg+=clubbed[i][2];
			lcount+=1;
		} else {
      //console.log(`ravg: ${ravg}`)
      //console.log(`term to be added: ${clubbed[i][2]}`)
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
  console.log(`${n}, ${lrnf}`)
	return gboost(mdata, n, gimp(mdata, lrnf), lrnf)
}

const predmodify=()=>{
  let predString=document.querySelector("#predString").value;
  const data = predString.split("\n").map(row => row.split(",").map(value => isNaN(value) ? value : Number(value)));

  // Modifying the data.
  n = data[0].length
  let keys = data[0].map(key => key.trim());
  let mdata = data.map(row => 
      Object.fromEntries(keys.map((key, i) => [key, row[i]]))
  );
  mdata.shift();
  mdata = mdata.map(item => {
    let cleanedItem = {};
    for (let key in item) {
      cleanedItem[key.trim()] = item[key]; // Remove spaces around the key
    }
    return cleanedItem;
  });     
  //console.log(mdata)
  return mdata;
}

const predict = () => {
  if (tree.length>0){
    let dataset=predmodify()
    let results=[]
    for (let j=0; j<dataset.length; j++){
      let initial;
      let csvString=document.querySelector("#csvString").value;
      if (csvString){
        const data = csvString.split("\n").map(row => row.split(",").map(value => isNaN(value) ? value : Number(value)));
        n = data[0].length
        let keys = data[0].map(key => key.trim());
        //console.log("This is keys:")
        //console.log(keys);
        initial= modify().reduce((sum, row) => sum + row[keys[keys.length-1]], 0) / modify().length;
      } else {
        const data = pre_data.split("\n").map(row => row.split(",").map(value => isNaN(value) ? value : Number(value)));
        n = data[0].length
        let keys = data[0].map(key => key.trim());
        //console.log("This is keys:")
        //console.log(keys);
        initial= modifier(pre_data).reduce((sum, row) => sum + row[keys[keys.length-1]], 0) / modifier(pre_data).length;
      }
      //console.log(initial);
      
      for (let i=0; i<tree.length; i++){
        //console.log("Data:")
        //console.log(dataset[j][tree[i][0]], tree[i][1], tree[i][2], tree[i][3]);
        dataset[j][tree[i][0]] <= tree[i][1] ? initial += tree[i][2] : initial += tree[i][3];
      }
      if(Object.values(dataset[j])[0]){
        results.push(Math.abs(initial.toFixed(2)));
      }
    }
    let textStr="Predictions:\n"
    textStr+=results.join('\n')
    document.querySelector("#predresults").value=textStr;
  } else {
    alert("Kindly train on the sample data first!")
  }
}

document.querySelector("#submit").addEventListener('click', ()=>{
  if(modify().length!=0){
    alert("Data has been submitted successfully.")
    let n=Number(document.querySelector("#itn").value);
    let lrnf = Number(document.querySelector("#lrnf").value);
    if (n && lrnf){
      learn(modify(),n, lrnf);
    }else{learn(modify(),1000, 0.1);}
    //console.log(modify());
    console.log(tree);
  } else {
    alert("Please enter non-empty training data.")
  }
})

document.querySelector("#psubmit").addEventListener('click', ()=>{
  predict();
})


let pre_data;
document.querySelector("#abc").addEventListener('click', () => {
  const fileInput = document.querySelector("#csv");
  const file = fileInput.files[0]; // Get the selected file

  if (!file) {
      alert("No file selected!");
      return; 
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    pre_data=(e.target.result)
    let itn=Number(document.querySelector("#itn").value);
    let lrnf = Number(document.querySelector("#lrnf").value);
    //console.log(modifier(pre_data))
    if(pre_data){
      alert("File successfully submitted.")
      learn(modifier(pre_data),itn || 1000, lrnf || 0.1);
      //console.log(tree)
    } else {
      alert("No csv file chosen / csv file is empty")
    }
  }; 
  reader.readAsText(file); 
  }
  
)

