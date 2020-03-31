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
		target: "",
		target2: "",
		inputGeoJSON: "",
		outputGeoJSON: ""
	},
	methods: {
		
		calculateWithGeodesics() {
			this.parseJSON();
			
			var lat1 = this.coordA[1];
			var lon1 = this.coordA[0];
			var lat2 = this.coordB[1];
			var lon2 = this.coordB[0];
			var lat3 = this.coordC[1];
			var lon3 = this.coordC[0];
			var r1 = parseFloat(this.distA);
			var r2 = parseFloat(this.distB);
			var r3 = parseFloat(this.distC);
			
			var s12 = this.geodesicLength(lat1, lon1, lat2, lon2);
			console.log("s12: " + s12);
			
			var angle = this.cosineRule(r2, r1, s12);
			console.log("angle: " + angle);
			
			var azi12 = this.geodesicAzimuth(lat1, lon1, lat2, lon2);
			console.log("azi12: " + azi12);
			
			var azi14 = azi12 + angle;
			
			/*
			//because azi is negative
			azi13 = azi13 + 360;
			console.log("azi13: " + azi13);
			*/
			
			var geod = GeographicLib.Geodesic.WGS84;
			
			var p4 = geod.Direct(lat1, lon1, azi14, r1);
			
			console.log("p4.lat: " + p4.lat2);
			console.log("p4.lon: " + p4.lon2);
			
			//this.target = p4.lat2.toFixed(6) + "," + p4.lon2.toFixed(6);
			
			
			var azi15 = azi12 - angle;
			
			var p5 = geod.Direct(lat1, lon1, azi15, r1);
			
			console.log("p5.lat: " + p5.lat2);
			console.log("p5.lon: " + p5.lon2);
			
			//this.target2 = p5.lat2.toFixed(6) + "," + p5.lon2.toFixed(6);
			
			
			var s13 = this.geodesicLength(lat1, lon1, lat3, lon3);
			var angle2 = this.cosineRule(r3, r1, s13);
			var azi13 = this.geodesicAzimuth(lat1, lon1, lat3, lon3);
			var azi16 = azi13 + angle2;
			var p6 = geod.Direct(lat1, lon1, azi16, r1);
			console.log("p6.lat: " + p6.lat2);
			console.log("p6.lon: " + p6.lon2);
			
			var azi17 = azi13 - angle2;
			var p7 = geod.Direct(lat1, lon1, azi17, r1);
			console.log("p7.lat: " + p7.lat2);
			console.log("p7.lon: " + p7.lon2);
			
			this.closestPoints(p4.lat2, p4.lon2, p5.lat2, p5.lon2, p6.lat2, p6.lon2, p7.lat2, p7.lon2)
			
			this.exportJSON();
		},
		

		cosineRule(a, b, c) {
			
			console.log("a: " + a);
			console.log("b: " + b);
			console.log("c: " + c);
			
			//assume a, b, c << earth rad.
			var numerator = Math.pow(b, 2) + Math.pow(c, 2) - Math.pow(a, 2);
			console.log("num: " + numerator);
			var denominator = 2 * b * c;
			console.log("den: " + denominator);
			
			return this.degrees(Math.acos(numerator / denominator));
			
			/*
			//attempt spherical trig
			var numerator = Math.cos(a) - Math.cos(b) * Math.cos(c);
			console.log("num: " + numerator);
			var denominator = Math.sin(b) * Math.sin(c);
			console.log("den: " + denominator);
			
			return Math.acos(numerator / denominator);
			*/
			
		},
		
		geodesicLength(lat1, lon1, lat2, lon2) {
			var geod = GeographicLib.Geodesic.WGS84;
			
			var r = geod.Inverse(lat1, lon1, lat2, lon2);

			return r.s12;
		},
		
		geodesicAzimuth(lat1, lon1, lat2, lon2) {
			var geod = GeographicLib.Geodesic.WGS84;
			
			var r = geod.Inverse(lat1, lon1, lat2, lon2);
			
			return r.azi1;
		},
		
		radians(a) {
			return this.deg2Rad(a);
		},
		
		degrees(a) {
			return this.rad2Deg(a);
		},
		
		parseJSON() {
			var geoJSON = JSON.parse(this.inputGeoJSON);
			this.coordA = geoJSON.features[0].geometry.coordinates;
			this.distA = geoJSON.features[0].properties.radius;
			this.coordB = geoJSON.features[1].geometry.coordinates;
			this.distB = geoJSON.features[1].properties.radius;
			this.coordC = geoJSON.features[2].geometry.coordinates;
			this.distC = geoJSON.features[2].properties.radius;
		},
		
		exportJSON() {
		
			var target = {
        "type": "Feature",
        "properties": {
            "shape": "Marker",
            "maps": ["default-map"],
            "name": "Unnamed Layer",
            "category": "default",
            "id": this.uuid()
        },
        "geometry": {
            "type": "Point",
            "coordinates": [this.target.split(",")[1], this.target.split(",")[0]]
        }
			};
			/*
			var target2 = {
        "type": "Feature",
        "properties": {
            "shape": "Marker",
            "maps": ["default-map"],
            "name": "Unnamed Layer",
            "category": "default",
            "id": this.uuid()
        },
        "geometry": {
            "type": "Point",
            "coordinates": [this.target2.split(",")[1], this.target2.split(",")[0]]
        }
			};
			*/
			
			var geoJSON = JSON.parse(this.inputGeoJSON);
			
			geoJSON.features[3] = target;
			//geoJSON.features[4] = target2;
			
			
			this.outputGeoJSON = JSON.stringify(geoJSON);
		},
		
		uuid() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},
		
		calculateFromGeoJSON() {
			this.parseJSON();
			
			var latA_deg = this.coordA[1];
			var lonA_deg = this.coordA[0];
			
			var x0 = this.latDegToLatKmEarth(latA_deg);
			var y0 = this.lonDegToLonKmEarth(lonA_deg, latA_deg);
			var r0 = parseFloat(this.distA) / 1000;
			
			var latB_deg = this.coordB[1];
			var lonB_deg = this.coordB[0];
			
			var x1 = this.latDegToLatKmEarth(latB_deg);
			var y1 = this.lonDegToLonKmEarth(lonB_deg, latB_deg) ;
			var r1 = parseFloat(this.distB) / 1000;
			
			var latC_deg = this.coordC[1];
			var lonC_deg = this.coordC[0];
			
			var x2 = this.latDegToLatKmEarth(latC_deg);
			var y2 = this.lonDegToLonKmEarth(lonC_deg, latC_deg);
			var r2 = parseFloat(this.distC) / 1000;
			
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
			
			var x4 = this.calcX(x0, y0, x1, y1, d01, aOverD01, h01, false);
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
			
			var x6 = this.calcX(x0, y0, x2, y2, d02, aOverD02, h02, false);
			var y6 = this.calcY(x0, y0, x2, y2, d02, aOverD02, h02, false);
			
			console.log("x5: " + x5);
			console.log("y5: " + y5);
			
			console.log("x6: " + x6);
			console.log("y6: " + y6);
			
			
			var lat3_deg = this.latKmToLatDegEarth(x3, latA_deg);
			var lon3_deg = this.lonKmToLonDegEarth(y3, lat3_deg);
			
			var lat4_deg = this.latKmToLatDegEarth(x4, latA_deg);
			var lon4_deg = this.lonKmToLonDegEarth(y4, lat4_deg);
			
			var lat5_deg = this.latKmToLatDegEarth(x5, latA_deg);
			var lon5_deg = this.lonKmToLonDegEarth(y5, lat5_deg);
			
			var lat6_deg = this.latKmToLatDegEarth(x6, latA_deg);
			var lon6_deg = this.lonKmToLonDegEarth(y6, lat6_deg);
			
			/*
			//iterate on values
			lat3_deg = this.latKmToLatDegEarth(x3, lat3_deg);
			lon3_deg = this.lonKmToLonDegEarth(y3, lat3_deg);
			
			lat4_deg = this.latKmToLatDegEarth(x4, lat4_deg);
			lon4_deg = this.lonKmToLonDegEarth(y4, lat4_deg);
			
			lat5_deg = this.latKmToLatDegEarth(x5, lat5_deg);
			lon5_deg = this.lonKmToLonDegEarth(y5, lat5_deg);
			
			lat6_deg = this.latKmToLatDegEarth(x6, lat6_deg);
			lon6_deg = this.lonKmToLonDegEarth(y6, lat6_deg);
			*/
			
			console.log("Point 3: " + lat3_deg + "," + lon3_deg);
			console.log("Point 4: " + lat4_deg + "," + lon4_deg);
			console.log("Point 5: " + lat5_deg + "," + lon5_deg);
			console.log("Point 6: " + lat6_deg + "," + lon6_deg);
			
			this.closestPoints(lat3_deg, lon3_deg, lat4_deg, lon4_deg, lat5_deg, lon5_deg, lat6_deg, lon6_deg);	
			
			this.exportJSON();
		},
		
		latKmToLatDegEarth(lat_km, lat_d_old) {
			var lat_r_old = this.deg2Rad(lat_d_old);
			var earthRadAtOldLat = this.earthRadiusAtLat(lat_r_old);
			var lat_r = lat_km / earthRadAtOldLat;
			return this.rad2Deg(lat_r);
		},
		
		lonKmToLonDegEarth(lon_km, lat_d_old) {
			var lat_r_old = this.deg2Rad(lat_d_old);
			var parallelRadiusAtOldLat = this.parallelRadiusAtLat(lat_r_old);
			var lon_r = lon_km / parallelRadiusAtOldLat;
			return this.rad2Deg(lon_r);
		},
		
		
		latDegToLatKmEarth(lat_d) {
			var lat_r = this.deg2Rad(lat_d);
			var earthRad = this.earthRadiusAtLat(lat_r);
			console.log("Earth Radius at Latitude: " + lat_d + " = " + earthRad);
			return lat_r * earthRad;
		},
		
		lonDegToLonKmEarth(lon_d, lat_d) {
			var lat_r = this.deg2Rad(lat_d);
			var lon_r = this.deg2Rad(lon_d);
			
			return lon_r * this.parallelRadiusAtLat(lat_r);
		},
		
		earthRadiusAtLat(lat) {
		var WGS_ELLIPSOID = { a: 6378137.0, b: 6356752.314 };
    var f1 = Math.pow((Math.pow(WGS_ELLIPSOID.a, 2) * Math.cos(lat)), 2);
    var f2 = Math.pow((Math.pow(WGS_ELLIPSOID.b, 2) * Math.sin(lat)), 2);
    var f3 = Math.pow((WGS_ELLIPSOID.a * Math.cos(lat)), 2);
    var f4 = Math.pow((WGS_ELLIPSOID.b * Math.sin(lat)), 2);

    var radius =  Math.sqrt((f1 + f2) / (f3 + f4));

    return radius / 1000;
		},
		
		parallelRadiusAtLat(lat) {
			return this.earthRadiusAtLat(lat) * Math.cos(lat);
		},
		
		calculate() {
			
			var latA_deg = parseFloat(this.coordA.split(",")[0]);
			var lonA_deg = parseFloat(this.coordA.split(",")[1]);
			
			var x0 = this.latDegToLatKm(latA_deg);
			var y0 = this.lonDegToLonKm(lonA_deg, latA_deg);
			var r0 = parseFloat(this.distA) / 1000;
			
			var latB_deg = parseFloat(this.coordB.split(",")[0]);
			var lonB_deg = parseFloat(this.coordB.split(",")[1]);
			
			var x1 = this.latDegToLatKm(latB_deg);
			var y1 = this.lonDegToLonKm(lonB_deg, latB_deg);
			var r1 = parseFloat(this.distB) / 1000;
			
			var latC_deg = parseFloat(this.coordC.split(",")[0]);
			var lonC_deg = parseFloat(this.coordC.split(",")[1]);
			
			var x2 = this.latDegToLatKm(latC_deg);
			var y2 = this.lonDegToLonKm(lonC_deg, latC_deg);
			var r2 = parseFloat(this.distC) / 1000;
			
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
			
			var x4 = this.calcX(x0, y0, x1, y1, d01, aOverD01, h01, false);
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
			
			var x6 = this.calcX(x0, y0, x2, y2, d02, aOverD02, h02, false);
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
			var delta = h * (x1 - x0) / d;
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