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

require( ["js/qlik","./selectionSync.js"], function ( qlik,selectionSync ) {

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
			$( "#title" ).html( "Executive Dashboard");//layout.qTitle );
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
	var app = qlik.openApp('d4af04de-ed3f-4ab7-9570-f0b8a807b319', config);

	var app1 = qlik.openApp('ae337147-0d25-40c9-8cdb-4fd6bca56d4b', config);



	//get objects -- inserted here --
	app.getObject('CurrentSelections1','CurrentSelections');
	app1.getObject('CurrentSelections2','CurrentSelections');
	app1.getObject('QV07','VXcja');
	app1.getObject('QV011','HjrCYy');
	app.getObject('QV010','GhrxAt');
	app.getObject('QV09','yJmWEkw');
	app.getObject('QV08','mzsTmdJ');
	app.getObject('QV04','tbbXNM');
	app.getObject('QV06','hukcvcJ');
	
	app.getObject('QV05','wRCzULJ');
	
	
	app.getObject('QV03','45f3b991-30a5-4c76-ae36-e5a3237262d4');
	app.getObject('QV02','7e26d1af-af81-4469-877d-af2b5abb9712');
	app.getObject('QV01','5ccb0c6e-0af9-47de-bc6c-a51370f5b504');
	
	
	
	
	
	
	
	//create cubes and lists -- inserted here --
	if ( app ) {
		new AppUi( app );
	}
	
	    /**
     * Initializes Application Links For 
     * @param {string} host 
     * @param {string} linkText
     */


	//selectionSync.initAppLinks((config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ), "Go To App");
	selectionSync.initAppLinks((config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "" ), "Go To App", { app: app, app1: app1 });
	
	
	
    //selectionSync.selectionSync([app, app1],
    //                [["[MasterDate Year]", "[RefDate Year]"],
    //                 ["[MasterDate Month]","[RefDate Month]"]]);
} );
