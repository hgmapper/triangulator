new Vue({
	el: '#app',
	vuetify: new Vuetify({
		theme: {
			themes: {
				light: {
					primary: '#004039'
				}
			}
		}
	}),
	data: {
		showLatLon: false,
		showLonLat: false,
		showGeoJSON: false,
		coordA: "",
		distA: "",
		coordB: "",
		distB: "",
		coordC: "",
		distC: "",
		target: "",
		inputGeoJSON: "",
		outputGeoJSON: ""
	},
	methods: {
		
		calculate() {
			
			var lat1, lon1, lat2, lon2, lat3, lon3;
			
			if(this.showGeoJSON) {
				this.parseJSON();
				
				lat1 = this.coordA[1];
				lon1 = this.coordA[0];
				lat2 = this.coordB[1];
				lon2 = this.coordB[0];
				lat3 = this.coordC[1];
				lon3 = this.coordC[0];
			}
			
			if(this.showLatLon) {
				lat1 = parseFloat(this.coordA.split(",")[0]);
				lon1 = parseFloat(this.coordA.split(",")[1]);
				lat2 = parseFloat(this.coordB.split(",")[0]);
				lon2 = parseFloat(this.coordB.split(",")[1]);
				lat3 = parseFloat(this.coordC.split(",")[0]);
				lon3 = parseFloat(this.coordC.split(",")[1]);
			}
			
			if(this.showLonLat) {
				lat1 = parseFloat(this.coordA.split(",")[1]);
				lon1 = parseFloat(this.coordA.split(",")[0]);
				lat2 = parseFloat(this.coordB.split(",")[1]);
				lon2 = parseFloat(this.coordB.split(",")[0]);
				lat3 = parseFloat(this.coordC.split(",")[1]);
				lon3 = parseFloat(this.coordC.split(",")[0]);
			}
			
			var r1 = parseFloat(this.distA);
			var r2 = parseFloat(this.distB);
			var r3 = parseFloat(this.distC);
			
			var s12 = this.geodesicLength(lat1, lon1, lat2, lon2);
			
			var angle = this.cosineRule(r2, r1, s12);
			
			var azi12 = this.geodesicAzimuth(lat1, lon1, lat2, lon2);
			
			var azi14 = azi12 + angle;
			
			var geod = GeographicLib.Geodesic.WGS84;
			
			var p4 = geod.Direct(lat1, lon1, azi14, r1);
			
			var azi15 = azi12 - angle;
			
			var p5 = geod.Direct(lat1, lon1, azi15, r1);
			
			var s13 = this.geodesicLength(lat1, lon1, lat3, lon3);
			var angle2 = this.cosineRule(r3, r1, s13);
			var azi13 = this.geodesicAzimuth(lat1, lon1, lat3, lon3);
			var azi16 = azi13 + angle2;
			var p6 = geod.Direct(lat1, lon1, azi16, r1);
			
			var azi17 = azi13 - angle2;
			var p7 = geod.Direct(lat1, lon1, azi17, r1);
			
			this.closestPoints(p4.lat2.toFixed(6), 
												 p4.lon2.toFixed(6), 
												 p5.lat2.toFixed(6), 
												 p5.lon2.toFixed(6), 
												 p6.lat2.toFixed(6), 
												 p6.lon2.toFixed(6), 
												 p7.lat2.toFixed(6), 
												 p7.lon2.toFixed(6))
			
			if(this.showLonLat) {
				var lon = this.target.split(",")[1];
				var lat = this.target.split(",")[0];
				this.target = lon + "," + lat;
			}
			if(this.showGeoJSON) {
				this.exportJSON();
			}
		},

		cosineRule(a, b, c) {
			
			var numerator = Math.pow(b, 2) + Math.pow(c, 2) - Math.pow(a, 2);
			
			var denominator = 2 * b * c;
			
			return this.degrees(Math.acos(numerator / denominator));
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
		
		radians(deg) {
			return deg * Math.PI / 180;
		},
		
		degrees(rad) {
			return 180.0 * rad / Math.PI;
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
			
			var geoJSON = JSON.parse(this.inputGeoJSON);
			
			geoJSON.features[3] = target;
			
			
			this.outputGeoJSON = JSON.stringify(geoJSON);
		},
		
		uuid() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
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
		}
	}
})