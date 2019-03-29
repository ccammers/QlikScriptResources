// JavaScript
define({
    selectionSync: function(apps, fieldMappings) {
        /**
         * Returns true if two Set<T>'s are equal
         * @template T
         * @param {Set<T>} a
         * @param {Set<T>} b
         * */
        function setsAreEqual(a, b) {
            if (a.size !== b.size) {
                return false;
            }
            
            for (var ax of a.values()) {
                if (!b.has(ax)) {
                    return false;
                }
            }
    
            return true;
        }

        /**
         * @template T 
         * @param {Readonly<T>} row 
         */
        function rowDataType(row) {
            if ("qNum" in row) {
                return "number"
            } else {
                return "string";
            }
        }
    
        /**
         * @template T
         * @param {ReadonlyArray<Readonly<T>>} rows
         * @returns {ReadonlyArray<number | string>}
         */
        function toSelectedValues(rows) {
            if (rows.length === 0) {
                return [];
            } else {
                switch (rowDataType(rows[0])) {
                    case "number": return new Set(rows.filter(x => x.qState === "S").map(x => x.qNum));
                    case "string": return new Set(rows.filter(x => x.qState === "S").map(x => x.qText));
                }
            }
        }

        fieldMappings.forEach(oneSetOfMappings => {
            const fields = new Array(oneSetOfMappings.length);
            for (let i = 0; i < oneSetOfMappings.length; i++) {
                fields[i] = apps[i].field(oneSetOfMappings[i]).getData();
            }
    
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i];
                console.log("field " + i, field);
                field.OnData.bind(function() {
					console.log("field", field);
                    const selectedValues = toSelectedValues(field.rows);
                    console.log("selectedValues", selectedValues);
                    for (let j = 0; j < apps.length; j++) {
                        if (i !== j) {
                            const otherField = fields[j];
                            console.log("otherField", otherField);
                            const otherSelectedValues = toSelectedValues(otherField.rows);
                            console.log("otherSelectedValues", otherSelectedValues);
                            if (!setsAreEqual(selectedValues, otherSelectedValues) && !field.requestActive && !otherField.requestActive) {
                                otherField.selectValues([...selectedValues], false, true);
                            }
                        }
                    }
                });
            }
        })
    },
    initAppLinks: function (host, linkText, parentApps) {
        // Get The Stringified Version Of The Function Calling "this" Function
        const functionString = arguments.callee.caller.toString();
        // Get App Variable Declaration Lines
        const appInitializationLines = functionString.match(/(var|let|const)\s*[\w\d]+\s*=\s*qlik.openApp\(.+\)\s*;/g);
        // Get Variable Names Out Of App Variable Declarations Lines
        const appVariableNames = appInitializationLines.map(str => /\w+\s*([\w\d]+)\s*=/.exec(str)[1]);
        // Get A Handle To Each App Based Off Of App Variable Names
        const apps = appVariableNames.map(x => parentApps[x]);
        // Get Visualization Initialization Lines
        const objectInitializationLines = functionString.match(/\s*[\w\d]+\s*\.getObject\(['"\w\d]+,.+\)\s*;/g);
        // Get { appVariableName: string, htmlId: string, objectId: string } Objects From Visualization Initialization Lines
        const appHtmlIdObjectIdRelationships = objectInitializationLines.map(x => x.match(/\s*([\w\d]+)\.getObject\(['"]([\w\d-]+)['"]\s*\,\s*['"]([\w\d-]+)['"]/))
                                                                        .map(x => ({ appVariableName: x[1], htmlId: x[2], objectId: x[3]}));

        // Inject Anchors To App Based Off Of Above Information
        appHtmlIdObjectIdRelationships.forEach(x => {
            const el = document.getElementById(x.htmlId);
            const a = document.createElement("a");
            a.setAttribute("class", "vis-app-link");
            a.text = linkText;
            a.target = "_empty";
            a.href = host + "/sense/app/" + (apps[appVariableNames.indexOf(x.appVariableName)].id);
            el.parentElement.appendChild(a);
        });

        // Show Link On Hover Of Container
        // DON'T Show Link If In The Mashup Editor Preview Tab
        // Attempted Ways To Detect If In The Mashup Editor Preview Tab
        // 1. The .vis-app-link Anchor Is Not The Last Child In IT's Container (A .qvwrapper Is Inferred To Be The Conflicting Element)
        // 2. The .vis-app-link Anchor Has A Previous Sibling Of .qvwrapper
        // NOTE: .qvwrapper Is The HTML Class Of The UI Element That Is The Delete Button Of A Visualization When In The Mashup Editor Preview Tab
		const styleString = ".vis-app-link { position: absolute; top: 0; right: 0; display: none; } "
			+ [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => {
			return ["sm", "md", "lg"].map(size => {
				return ".col-" + size + "-" + i + ":hover > .vis-app-link { display: block; } .qvwrapper + .vis-app-link, .vis-app-link:not(:last-child) { display: none !important; }";
			}).reduce((prev, curr) => prev + " " + curr, "");
		}).reduce((prev, curr) => prev + " " + curr, "");
		
		console.log("styleString", styleString);
        // const styleString = ".vis-app-link { position: absolute; top: 0; right: 0; display: none; } .col-sm-4:hover .vis-app-link { display: block; } .qvwrapper + .vis-app-link, .vis-app-link:not(:last-child) { display: none !important; }";
        const style = document.createElement("style");
        style.innerHTML = styleString;
        document.head.appendChild(style);
    }
});