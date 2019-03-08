/*
 * Bootstrap-based responsive mashup
 * @owner Enter you name here (xxx)
 */
/*
 *    Fill in host and port for Qlik engine
 */
var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );

var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
//to avoid errors in workbench: you can remove this when you have added an app
var app;
require.config( {
	baseUrl: (config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ) + config.prefix + "resources"
} );

require( ["js/qlik"], function ( qlik ) {

	var control = false;
	qlik.setOnError( function ( error ) {
		$( '#popupText' ).append( error.message + "<br>" );
		if ( !control ) {
			control = true;
			$( '#popup' ).delay( 1000 ).fadeIn( 1000 ).delay( 11000 ).fadeOut( 1000 );
		}
	} );

	$( "#closePopup" ).click( function () {
		$( '#popup' ).hide();
	} );
	if ( $( 'ul#qbmlist li' ).length === 0 ) {
		$( '#qbmlist' ).append( "<li><a>No bookmarks available</a></li>" );
	}
	$( "body" ).css( "overflow: hidden;" );
	function AppUi ( app ) {
		var me = this;
		this.app = app;
		app.global.isPersonalMode( function ( reply ) {
			me.isPersonalMode = reply.qReturn;
		} );
		app.getAppLayout( function ( layout ) {
			$( "#title" ).html( layout.qTitle );
			$( "#title" ).attr( "title", "Last reload:" + layout.qLastReloadTime.replace( /T/, ' ' ).replace( /Z/, ' ' ) );
			//TODO: bootstrap tooltip ??
		} );
		app.getList( 'SelectionObject', function ( reply ) {
			$( "[data-qcmd='back']" ).parent().toggleClass( 'disabled', reply.qSelectionObject.qBackCount < 1 );
			$( "[data-qcmd='forward']" ).parent().toggleClass( 'disabled', reply.qSelectionObject.qForwardCount < 1 );
		} );
		app.getList( "BookmarkList", function ( reply ) {
			var str = "";
			reply.qBookmarkList.qItems.forEach( function ( value ) {
				if ( value.qData.title ) {
					str += '<li><a data-id="' + value.qInfo.qId + '">' + value.qData.title + '</a></li>';
				}
			} );
			str += '<li><a data-cmd="create">Create</a></li>';
			$( '#qbmlist' ).html( str ).find( 'a' ).on( 'click', function () {
				var id = $( this ).data( 'id' );
				if ( id ) {
					app.bookmark.apply( id );
				} else {
					var cmd = $( this ).data( 'cmd' );
					if ( cmd === "create" ) {
						$( '#createBmModal' ).modal();
					}
				}
			} );
		} );
		$( "[data-qcmd]" ).on( 'click', function () {
			var $element = $( this );
			switch ( $element.data( 'qcmd' ) ) {
				//app level commands
				case 'clearAll':
					app.clearAll();
					break;
				case 'back':
					app.back();
					break;
				case 'forward':
					app.forward();
					break;
				case 'lockAll':
					app.lockAll();
					break;
				case 'unlockAll':
					app.unlockAll();
					break;
				case 'createBm':
					var title = $( "#bmtitle" ).val(), desc = $( "#bmdesc" ).val();
					app.bookmark.create( title, desc );
					$( '#createBmModal' ).modal( 'hide' );
					break;
			}
		} );
	}

	//callbacks -- inserted here --
	//open apps -- inserted here --
	var app = qlik.openApp('Global Dashboard(Formerly Service and Manufacturing Sales).qvf', config);
	var app2 = qlik.openApp('Ledger Discovery with Currency Conversion.qvf', config);


	//get objects -- inserted here --
	app.getObject('QV01','52b82dc3-476f-43e0-b40f-b8914b597dd3');
	app.getObject('QV02','c64c586f-d8a2-45b6-a008-510a215e5277');
	app.getObject('QV022','kLjPkMC');
	app2.getObject('QV03','0ae6aea6-97c4-4e0f-8cd0-3870f82712ef');
	app2.getObject('QV04','dvdyj');
	app2.getObject('QV044','bc7fbce3-07c9-4f3f-8f2f-98f5cac5c84e');
	
    
	//create cubes and lists -- inserted here --
	if ( app ) {
		new AppUi( app );
    }

    /**
     * Intializes Syncing Of Dimensions Between Apps
     * @param {any[]} apps 
     * @param {string[][]} fieldMappings
     */
    function initFieldSyncer(apps, fieldMappings) {
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
                // console.log("field " + i, field);
                field.OnData.bind(function() {
                    const selectedValues = toSelectedValues(field.rows);
                    // console.log("selectedValues", selectedValues);
                    for (let j = 0; j < apps.length; j++) {
                        if (i !== j) {
                            const otherField = fields[j];
                            // console.log("otherField", otherField);
                            const otherSelectedValues = toSelectedValues(otherField.rows);
                            // console.log("otherSelectedValues", otherSelectedValues);
                            if (!setsAreEqual(selectedValues, otherSelectedValues)) {
                                otherField.selectValues([...selectedValues], false, true);
                            }
                        }
                    }
                });
            }
        })
    }

    initFieldSyncer([app, app2],
                    [["[MasterDate Month]", "[ledger trans_date Month]"],
                     ["[MasterDate Year]", "[ledger trans_date Year]"]]);
});