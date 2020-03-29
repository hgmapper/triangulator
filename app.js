new Vue({
	el: '#app',
	vuetify: new Vuetify({
		theme: {
			themes: {
				light: {
					primary: '#1C39BB'
				}
			}
		}
	}),
	data: {
		coordA: "",
		distA: "",
		coordB: "",
		distB: "",
		coordC: "",
		distC: "",
		target: ""
	},
	methods: {
		calculate() {
			var latA_deg = parseFloat(this.coordA.split(",")[0]);
			var lonA_deg = parseFloat(this.coordA.split(",")[1]);
			
			var x0 = this.latDegToLatKm(latA_deg);
			var y0 = this.lonDegToLonKm(lonA_deg, latA_deg);
			var r0 = parseFloat(this.distA);
			
			var latB_deg = parseFloat(this.coordB.split(",")[0]);
			var lonB_deg = parseFloat(this.coordB.split(",")[1]);
			
			var x1 = this.latDegToLatKm(latB_deg);
			var y1 = this.lonDegToLonKm(lonB_deg, latB_deg);
			var r1 = parseFloat(this.distB);
			
			var latC_deg = parseFloat(this.coordC.split(",")[0]);
			var lonC_deg = parseFloat(this.coordC.split(",")[1]);
			
			var x2 = this.latDegToLatKm(latC_deg);
			var y2 = this.lonDegToLonKm(lonC_deg, latC_deg);
			var r2 = parseFloat(this.distC);
			
			console.log("x0: " + x0);
			console.log("y0: " + y0);
			console.log("r0: " + r0);
			
			console.log("x1: " + x1);
			console.log("y1: " + y1);
			console.log("r1: " + r1);
			
			console.log("x2: " + x2);
			console.log("y2: " + y2);
			console.log("r2: " + r2);
			
			
			var d01 = this.calcD(x0, y0, x1, y1);
			console.log("d01: " + d01);
			
			var aOverD01 = this.calcAOverD(x0, y0, r0, x1, y1, r1);
			console.log("aOverD01: " + aOverD01);
			
			var h01 = this.calcH(x0, y0, r0, x1, y1, r1);
			console.log("h01: " + h01);
			
			var x3 = this.calcX(x0, y0, x1, y1, d01, aOverD01, h01, true);
			var y3 = this.calcY(x0, y0, x1, y1, d01, aOverD01, h01, true);
			
			var x4 = this.calcY(x0, y0, x1, y1, d01, aOverD01, h01, false);
			var y4 = this.calcY(x0, y0, x1, y1, d01, aOverD01, h01, false);
			
			console.log("x3: " + x3);
			console.log("y3: " + y3);
			
			console.log("x4: " + x4);
			console.log("y4: " + y4);
			
			
			var d02 = this.calcD(x0, y0, x2, y2);
			console.log("d02: " + d02);
			
			var aOverD02 = this.calcAOverD(x0, y0, r0, x2, y2, r2);
			console.log("aOverD02: " + aOverD02);
			
			var h02 = this.calcH(x0, y0, r0, x2, y2, r2);
			console.log("h02: " + h02);
			
			var x5 = this.calcX(x0, y0, x2, y2, d02, aOverD02, h02, true);
			var y5 = this.calcY(x0, y0, x2, y2, d02, aOverD02, h02, true);
			
			var x6 = this.calcY(x0, y0, x2, y2, d02, aOverD02, h02, false);
			var y6 = this.calcY(x0, y0, x2, y2, d02, aOverD02, h02, false);
			
			console.log("x5: " + x5);
			console.log("y5: " + y5);
			
			console.log("x6: " + x6);
			console.log("y6: " + y6);
			
			
			var lat3_deg = this.latKmToLatDeg(x3);
			var lon3_deg = this.lonKmToLonDeg(y3, lat3_deg);
			
			var lat4_deg = this.latKmToLatDeg(x4);
			var lon4_deg = this.lonKmToLonDeg(y4, lat4_deg);
			
			var lat5_deg = this.latKmToLatDeg(x5);
			var lon5_deg = this.lonKmToLonDeg(y5, lat5_deg);
			
			var lat6_deg = this.latKmToLatDeg(x6);
			var lon6_deg = this.lonKmToLonDeg(y6, lat6_deg);
			
			console.log("Point 3: " + lat3_deg + "," + lon3_deg);
			console.log("Point 4: " + lat4_deg + "," + lon4_deg);
			console.log("Point 5: " + lat5_deg + "," + lon5_deg);
			console.log("Point 6: " + lat6_deg + "," + lon6_deg);
			
			this.closestPoints(lat3_deg, lon3_deg, lat4_deg, lon4_deg, lat5_deg, lon5_deg, lat6_deg, lon6_deg);	
		},
		
		calcD(x0, y0, x1, y1) {
			return Math.sqrt((x1 - x0)*(x1 - x0) + (y1 - y0)*(y1 - y0));
		},
		
		calcAOverD(x0, y0, r0, x1, y1, r1) {
			var numerator = r0*r0 - r1*r1 + (x1 - x0)*(x1 - x0) + (y1 - y0)*(y1 - y0);
			var denominator = 2 * ((x1 - x0)*(x1 - x0) + (y1 - y0)*(y1 - y0));
			return numerator / denominator;
		},
		
		calcH(x0, y0, r0, x1, y1, r1) {
			var numerator = r0*r0 - r1*r1 + (x1 - x0)*(x1 - x0) + (y1 - y0)*(y1 - y0);
			var denominator = 4 * ((x1 - x0)*(x1 - x0) + (y1 - y0)*(y1 - y0));
			return Math.sqrt(r0*r0 - numerator*numerator/denominator);
		},
		
		calcX(x0, y0, x1, y1, d, aOverD, h, isFirstSolution) {
			var alpha = (1 - aOverD) * x0;
			var beta = aOverD * x1;
			var gamma = isFirstSolution ? 1 : -1;
			var delta = h * (y1 - y0) / d;
			return alpha + beta + (gamma * delta);
		},
		
		calcY(x0, y0, x1, y1, d, aOverD, h, isFirstSolution) {
			var alpha = (1 - aOverD) * y0;
			var beta = aOverD * y1;
			var gamma = isFirstSolution ? -1 : 1;
			var delta = h * (y1 - y0) / d;
			return alpha + beta + (gamma * delta);
		},
		
		closestPoints(lat1, lon1, lat2, lon2, lat3, lon3, lat4, lon4) {
			var diff1 = Math.abs(lat1 - lat3);
			var diff2 = Math.abs(lat1 - lat4);
			var diff3 = Math.abs(lat2 - lat3);
			var diff4 = Math.abs(lat2 - lat4);
			var difflist = [diff1, diff2, diff3, diff4];
			var diffmin = diff1;
			for(var i = 0; i < difflist.length; i++) {
				if(difflist[i] < diffmin) {
					diffmin = difflist[i];
				}
			}
			
			if(diffmin == diff1 || diffmin == diff2) {
				this.target = lat1 + "," + lon1;
			}
			else {
				this.target = lat2 + "," + lon2;
			}
		},
		
		latDegToLatKm(lat_d) {
			return lat_d * 110.574;
		},
		
		lonDegToLonKm(lon_d, lat_d) {
			return lon_d * 111.320 * Math.cos(this.deg2Rad(lat_d));
		},
		
		latKmToLatDeg(lat_km) {
			return lat_km / 110.574;
		},
		
		lonKmToLonDeg(lon_km, lat_d) {
			return lon_km / 111.320 / Math.cos(this.deg2Rad(lat_d));
		},
		
		deg2Rad(deg) {
			return deg * Math.PI / 180;
		},
		
		rad2Deg(rad) {
			return 180.0 * rad / Math.PI;
		}
	}
})