/**
 * hsforms.js
 */

;(function ($) {
	/**
	 * hsForms jQuery plugin v1.0.0
	 */
	var PLUGIN_NS = 'hsForms';
	var calColorCache = {};
	var Plugin = function ( target, options ) {
	  this.$T = $(target);
	  this._init( target, options );
	  this.dimension = '';

	// Returns a function, that, as long as it continues to be invoked, will not
	// be triggered. The function will be called after it stops being called for
	// N milliseconds. If `immediate` is passed, trigger the function on the
	// leading edge, instead of the trailing.
	function debounce(func, wait, immediate) {
	  var timeout;
	  return function() {
		  var context = this, args = arguments;
		  var later = function() {
			  timeout = null;
			  if (!immediate) func.apply(context, args);
		  };
		  var callNow = immediate && !timeout;
		  clearTimeout(timeout);
		  timeout = setTimeout(later, wait);
		  if (callNow) func.apply(context, args);
	  };
	};


	  $(window).on(
		'resize orientationchange',
		debounce($.proxy(this.onResize, this), 250)
	  );

	  /** #### OPTIONS #### */
	  this.options= $.extend(
		  true,               // deep extend
		  {
			  DEBUG: false,
		  },
		  options
	  );

	  return this;
	}

	Plugin.prototype.onResize = function() {
	  $(document).trigger('resizeDebounced');
	};

	Plugin.prototype.validateMaxPersons = function () {
	  var _this = this;
	  var target = this.$T;
	  $(target).on('input', '.adults, .children', function() {
		var currentObj = $(this);
		var maxpersons = parseInt(currentObj.data('maxpersons'));
		var children = parseInt(target.find('.children').val());
    var adults = parseInt(target.find('.adults').val());
		if((adults + children) > maxpersons) {
		  currentObj.val(currentObj.val() - 1);
		  // message to the user that max persons limit reached.
		  toastr.clear();
		  toastr.info(_this.displayMessages.maxpersonsmsg);
		}
	  });
	  return this.$T;
	};

	Plugin.prototype.bindButtonEvents = function () {
	  var target = this.$T;
	  var _this = this;
	  // toggle for show/hide promotion input
	  $(target).on('click', '.promocode-link', function () {
		$(this).next().toggle();
	  });

	  // show/hide add rooms link
	  if(this._getChildren('.hidden-rooms') > 0) {
		$('.add-rooms', target).show();
	  }

	  // add-room btn click
	  $(target).on('click', '.add-room', function () {
		$('.hidden-rooms', target).children(':first').appendTo(target.find('.room-rows'));
		if(_this._getChildren('.hidden-rooms') == 0) {
		  $('.add-rooms', target).hide();
		}
	  });

	  // remove-room btn click
	  $(target).on('click', '.remove-room', function () {
		$('.room-rows', target).children(':last').prependTo(target.find('.hidden-rooms'));
		if(_this._getChildren('.hidden-rooms') > 0) {
		  $('.add-rooms', target).show();
		}
	  });

	  $(target).on('click', '.submit-btn', function (event) {
		event.preventDefault();
		_this.$form.submit();
	  });
	};

	Plugin.prototype._getChildren = function (selector) {
	  var target = this.$T;
	  return $(selector, target).children().length;
	};

	Plugin.prototype._replaceVars = function(msg, data) {
	  for (var k in data) {
		if (data.hasOwnProperty(k)) {
		  msg = msg.replace("{"+k+"}",data[k]);
		}
	  }
	  return msg;
	};

	Plugin.prototype._getDayNames = function() {
	  var $sunday = moment("01.11.2015", "DD.MM.YYYY");
	  $sunday.locale(this.lang);
	  var $result = new Array();
	  for ($i=0;$i<this.daysAllowedArrival.length;$i++) {
		  if (this.daysAllowedArrival[$i] == 1) {
			  $result.push($sunday.clone().day($i).format("dddd"));
		  }
	  }
	  return $result.join(', ');
	};

	Plugin.prototype._stopBootstrapFocus = function(e) {
	  e.stopPropagation();
	}

	Plugin.prototype.bindCal = function () {
	  var target = this.$T;
	  var _this = this;

	  // binding calendar events
	  for(i = 1; i <= _this.restrictions.maxrooms; i++) {
		$("#input_de"+i+"-"+_this.uid).on('onm.cal.message', function(evt, messageType, messageKey) {
		  if (!_this.displayMessages[messageType + '.' + messageKey]) {
			  return;
		  }
		  var msg = _this._replaceVars(_this.displayMessages[messageType + '.' + messageKey], _this.restrictions);
		  toastr.clear();
		  toastr.info(msg, 'Hinweis:');
		});

		// disable the form if travel periods are not given, or not enough to book a room
		disableTheForm = false;
		// adjust startdate in case the plugin is cached
		if(_this.travelperiods[0] != undefined) {
		  var mStartDate = moment(_this.travelperiods[0][0], 'YYYY-MM-DD');
		  var mEndDate = moment(_this.travelperiods[0][1], 'YYYY-MM-DD');
		  if(mEndDate.diff(mStartDate, 'days') >= _this.restrictions.minnights) {
			if (mStartDate < moment()) {
				mStartDate = moment();
			}

			// get the first valid date from where use can book. because first day of travel period couldn't be allowed.
			if(Array.isArray(_this.daysAllowedArrival)) {
			  var firstDay = mStartDate.day();
			  var daysPlus = 0;
			  for(; daysPlus < 7; daysPlus++) {
				  if(firstDay == 7) {
					  firstDay = 0;
				  }
				  if(_this.daysAllowedArrival[firstDay] == 1) {
					  break;
				  }
				  firstDay++;
			  }
			  mStartDate.add(daysPlus, 'days');
			}
			if(daysPlus > 0) {
			  if($('.js-dayadjustmentnotice', target).length) {
				  $('.js-dayadjustmentnotice', target).show();
			  }
			}

		  var dateSelector = "#input_de"+i+"-"+_this.uid;
		  var $minWidth = $(dateSelector).closest('.bookingForm').outerWidth();
		  if ($minWidth <= 0) {
			  $minWidth = ( ($('body').outerWidth() >= 200) && ($('body').outerWidth() <= 300)) ? $('body').outerWidth() - 30 : 300;
		  }
			// Kalender erstellen
			$(dateSelector).onmCal({
			  lang: _this.lang,
			  position: 'bottom-left',
			  displayMonths: 1,
			  rangeToElement: $('#input_de_to'+i+"-"+_this.uid),
			  minRange: _this.restrictions.minnights,
			  maxRange: _this.restrictions.maxnights,
			  popupRangeSelect: true,
			  dateRanges: _this.travelperiods,
			  width: Math.min($minWidth, 300),
			  value: [mStartDate.format(_this.dateFormat), mStartDate.clone().add(_this.restrictions.minnights, 'days').format(_this.dateFormat)]
			}).
			onmCal('resetValue', true).
			on('onm.cal.popupShown', function() {
			  $(document).on('focusin.bs.modal', _this._stopBootstrapFocus);
			}).
			on('onm.cal.created', function (e, container) {

			  // append legend to calendar
			  if($('.hsforms_legend', target).length) {
				$($('.hsforms_legend', target).get(0)).clone().appendTo($('.onm-cal', $(container)));
			  }

			}).
			on('onm.cal.monthChange', function (evt, startMonth, monthCount) {
			  // update calendar colors if API is enabled
			  if(_this.enableAPI) {
				_this.updateCalendarColors($(this), startMonth, monthCount);
			  }
			}).
			on('onm.cal.popupHidden', function() {
			  $(document).off('focusin.bs.modal', _this._stopBootstrapFocus);
			  $dayOfWeek = moment($(this).val(), _this.dateFormat).day();
			  if (Array.isArray(_this.daysAllowedArrival) && !_this.daysAllowedArrival[$dayOfWeek]) {
				$(this).onmCal('resetValue', true);
				toastr.clear();
				toastr.error(_this.displayMessages['restriction.arrivalDay'].replace('{0}', _this._getDayNames()), 'Hinweis:');
			  }
			});
			$('#input_de_to'+i+"-"+_this.uid).on('onm.cal.change', function (evt, rangeToDate) {
			  if(rangeToDate) {
				if($(this).closest('.room-row').find('.booker-in-content').is(':visible')) {
				  $(this).closest('.room-row').find('.booker-in-content').slideUp();
				}
			  }
			});
		  } else {
			disableTheForm = true;
		  }
		} else {
		  disableTheForm = true;
		}
		if(disableTheForm) {
		  _this.disableTheForm(target);
		}
	  }

	  var updateOnResize = function () {
		if (ResponsiveBootstrapToolkit.is('xs')) {
		  if(this.dimension != 'xs') {
			this.dimension = 'xs';
			for(i = 1; i <= _this.restrictions.maxrooms; i++) {
			  var dateSelector = "#input_de1-"+_this.uid;
			  var inContent = '.booker-in-content';
			  $(dateSelector).onmCal('update', $.extend({}, {
				lang: _this.lang,
				position: 'bottom-left',
				displayMonths: 1,
				rangeToElement: $('#input_de_to1-'+_this.uid),
				minRange: _this.restrictions.minnights,
				maxRange: _this.restrictions.maxnights,
				popupRangeSelect: true,
				dateRanges: _this.travelperiods,
				width: Math.min($minWidth, 300),
				value: [mStartDate.format(_this.dateFormat), mStartDate.clone().add(_this.restrictions.minnights, 'days').format(_this.dateFormat)]
			  }, {
				position: $(inContent, target)
			}));
			if($(inContent, target).is(':visible')) {
			  $(inContent, target).slideUp();
			}
			}
		  }
		} else {
		  if(this.dimension != 'no-xs') {
			this.dimension = 'no-xs';
			for(i = 1; i <= _this.restrictions.maxrooms; i++) {
			  var dateSelector = "#input_de1-"+_this.uid;
			  $(dateSelector).onmCal('update', {
				  lang: _this.lang,
				  position: 'bottom-left',
				  displayMonths: 1,
				  rangeToElement: $('#input_de_to1-'+_this.uid),
				  minRange: _this.restrictions.minnights,
				  maxRange: _this.restrictions.maxnights,
				  popupRangeSelect: true,
				  dateRanges: _this.travelperiods,
				  width: Math.min($minWidth, 300),
				  value: [mStartDate.format(_this.dateFormat), mStartDate.clone().add(_this.restrictions.minnights, 'days').format(_this.dateFormat)]
				});
			}
			$('.booker-in-content').hide();
		  }
		}
	  };
	  $(document).on('resizeDebounced', updateOnResize);
	  setTimeout(function() {
		updateOnResize();
	  }, 1);
	};

	Plugin.prototype.updateCalendarColors = function($el, startMonth, monthCount) {
	  var target = this.$T;
	  var _this = this;

	  var setMonthColor = function (colorData) {
		$.each(colorData,
			function (index, item) {
			  $el.onmCal('setDateElementColors', item.date, item.bgColor, item.fontColor);
			}
		);
	  };
	  for (var i = 0; i < monthCount; i++) {
		var month = startMonth.clone().add(i, 'months').format('YYYY-MM-DD');

		if (calColorCache[_this.uid + month]) {
			setMonthColor(calColorCache[_this.uid + month]);
			console.info('Loaded calendar COLORS from CACHE.');
		} else {
			$.ajax({
				url: hsforms_fe.ajaxurl,
				data: {
					action: 'fetch_colors',
					dateString: moment(month, 'YYYY-MM-DD').format('YYYY-MM-DD')
				},
				success: function (msg) {
					var json = $.parseJSON(msg)._embedded.web_availability_color;
					calColorCache[_this.uid + json[0].date] = json;
					setMonthColor(json);
					console.info('Loaded calendar COLORS from API.');
				},

				// we shouldn't get there, but if we do ignore any errors and proceed
				error: function () {
					console.error('hsforms - colors couldn\'t be fetched :-( ');
					return false;
				}
			});

		}
	  }

	};

	Plugin.prototype.disableTheForm = function(target) {
	  $('.submit-btn', target).removeClass('submit-btn').removeAttr('href');
	};

	Plugin.prototype.parseDate = function(selector) {
	  return moment(selector.val(), this.dateFormat);
	}

	Plugin.prototype.clearForm = function() {
	  this.$targetForm.find('input[type="hidden"]').each(function() {
		  $(this).removeAttr('name');
	  });
	}

	Plugin.prototype.handleForm = function () {
	  var _this = this;
	  this.$form.on('submit', function (event) {
		event.preventDefault();
		_this.process();
	  });
	};

	Plugin.prototype.validateDates = function () {
	  var target = this.$T;
	  var _this = this;
	  var selector = '#'+target.attr('id');
	  date1 = $('.date1', selector + " .rooms");
	  // validating start date for each room
	  date1.each(function(){
		var start = _this.parseDate($(this));
		var end = _this.parseDate($(this).closest('.room-row').find('.date2'));
		if(!end.isValid() || !start.isValid()) {
		  toastr.clear();
		  toastr.error("dates are not perfect.", 'Hinweis:');
		  return false;
		}
	  });
	  return true;
	};

	Plugin.prototype.process = function () {
	  if(this.validateDates() && this.childrenDataAlsoEntered()) {
		this.clearForm();
		this.buildForm();
		// hide all children boxes
		$('.childrens-age-box').hide();
		this.$targetForm.submit();
	  } else {
		return false;
	  }
	};

	Plugin.prototype.childrenDataAlsoEntered = function () {
		var target = this.$T;
	  var _this = this;
		var selector = '#'+target.attr('id');
		childrenBoxes = $('.childrens-age-box', selector + " .rooms");
		var filled = true;
		childrenBoxes.each(function(){
			if($(this).children().length > 0 && $(this).is(':hidden')) {
				$(this).show();
				filled = false;
			}
		});
		return filled;
	};

	Plugin.prototype.clearForm = function() {
	  this.$targetForm.empty();
	};

	Plugin.prototype.addInput = function(name, val) {
	  var _this = this;

	  $('<input>').attr({
		type: 'hidden',
		value: val,
		name: name
	  }).appendTo(_this.$targetForm);
	};

	Plugin.prototype.buildForm = function() {
	  var target = this.$T;
	  var _this = this;
	  var selector = '#'+target.attr('id');
	  $('.date1', selector + " .rooms").each(function(index) {
		var start = _this.parseDate($(this));
		var end = _this.parseDate($(this).closest('.room-row').find('.date2'));
		var nights = end.diff(start, 'days');
		// adding date[1,2,3..] input fields
		_this.addInput('date'+(index+1), start.format('YYYY-MM-DD'));

		// adding nights[1,2,3...]
		_this.addInput('nights'+(index+1), nights);
	  });

	  // adding adults[1,2,3...]
	  $('.adults', selector + " .rooms").each(function(index) {
		_this.addInput('adults'+(index+1), $(this).val());
	  });

	  // adding promotioncodes
	  $('.promotion-code', selector).each(function(index) {
		_this.addInput('promotioncode'+(index+1), $(this).val());
	  });

	  // adding ratecode
	  $('.ratecode', selector).each(function(index) {
		_this.addInput('ratecode'+(index+1), $(this).val());
	  });

	  // adding segment[1,2,3...]
	  $('.segments', selector + " .rooms").each(function(index) {
		var segment = $.trim($(this).val());
		if(segment) {
		  _this.addInput('segment'+(index+1), $(this).val());
		}
	  });

	  $('div.hidden-fields input[type=hidden]', target).each(function(index) {
		_this.addInput($(this).attr('name'), $(this).val());
	  });

	  // get Query params and add hidden inputs in the form as well
	  if(this.keepParams > 0) {
		var urlParams = this.getQueryParams();
		var self = this;
		var allowedParams = this.allowedParams;
		var allowAll = false;
		if(allowedParams[0] == 'all' || allowedParams.length == 0) {
		  allowAll = true;
		}
		$.each(urlParams, function(key, value) {
		  if(allowedParams.indexOf(key) !== -1 || allowAll) {
			self.addInput(key, value);
		  }
		});
	  }

	  _this._addChildrenFields();
	  _this.$targetForm.attr('action', _this.$form.attr('action'));
	};

	Plugin.prototype.getQueryParams = function () {
	  var match,
		  pl = /\+/g,  // Regex for replacing addition symbol with a space
		  search = /([^&=]+)=?([^&]*)/g,
		  decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
		  query = window.location.search.substring(1);

	  var urlParams = {};
	  while (match = search.exec(query))
		  urlParams[decode(match[1])] = decode(match[2]);
	  return urlParams;
	};

	Plugin.prototype._addChildrenFields = function () {
	  var target = this.$T;
	  var _this = this;
	  var selector = '#'+target.attr('id');
	  var i = 1;
	  $('.childrens-age-box', selector + " .rooms").each(function () {
		var fieldName = 'children'+i;
		var ages = [];
		$(this).children().each(function(){
		  ages.push(parseInt($(this).find('select.child-age').val()));
		});
		if(ages.length > 0) {
		  _this.addInput(fieldName, '['+ages.join(',')+']');
		}
		i++;
	  });
	};

	/** #### INITIALISER #### */
	Plugin.prototype._init = function ( target, options ) {
	  this.restrictions = options.restrictions;
	  this.displayMessages = options.displayMessages;
	  this.travelperiods = options.travelperiods;
	  this.daysAllowedArrival = options.daysAllowedArrival;
	  this.dateFormat = options.dateFormat;
	  this.keepParams = options.keepParams;
	  this.allowedParams = options.allowedParams;
	  this.$form = $('.bookingFormUI', target);
	  this.$targetForm = this.$form.parent().find('.booking-form').first();
	  this.uid = options.uid;
	  this.enableAPI = options.enableAPI;
	  this.lang = options.lang;
	  this.initResponsiveToolkit();
	  moment.locale(options.lang);
	  this.createChildrenAgeFields();
	  this.validateMaxPersons();
	  this.bindButtonEvents();
	  this.bindCal();
	  this.handleForm();
	};

	Plugin.prototype.initResponsiveToolkit = function(target) {
	  // custom visibility classes to not to depend on bootstrap
	  var visibilityDivs = {
		'xs': $('<div class="onm-d-block onm-d-sm-none"></div>'),
		'sm': $('<div class="onm-d-none onm-d-sm-block onm-d-md-none"></div>'),
		'md': $('<div class="onm-d-none onm-d-md-block onm-d-lg-none"></div>'),
		'lg': $('<div class="onm-d-none onm-d-lg-block onm-d-xl-none"></div>'),
		'xl': $('<div class="onm-d-none onm-d-xl-block"></div>')
	  };
	  ResponsiveBootstrapToolkit.use('Custom', visibilityDivs);
	};

	Plugin.prototype._addChildAgeBox = function(ID, target) {
	  var childAgeBox = $('.js-child-age-template', target).children().first();
	  $('#'+ID).append(childAgeBox.clone());

	  // Replace child number in label
	  var child = 1;
	  $('#'+ID).find('label').each(function(index, element) {
		$(element).replaceWith($(element).get(0).outerHTML.replace('{0}', child));
		child++;
	  });
	};

	Plugin.prototype.createChildrenAgeFields = function () {
	  var target = this.$T;
	  var _this = this;
	  $('.children', target).each(function () {
		var childrenBoxID = $(this).data('children-box-id');
		for(i = 0; i < $(this).val(); i++) {
		  _this._addChildAgeBox(childrenBoxID, target);
		}
	  });

	  // bind change event
	  $('.children', target).bind('change', function () {
		var childrenBoxID = $(this).data('children-box-id');
		var noOfChildrenHasToBe = $(this).val();
		if($('#'+childrenBoxID).is(':hidden')) {
			$('#'+childrenBoxID).show();
		}
		var noOfChildrenRightNow = $('#'+childrenBoxID).children().length;
		let diff = noOfChildrenHasToBe - noOfChildrenRightNow;

		if(diff > 0) {
		  for (i = 0; i < diff; i ++) {
			_this._addChildAgeBox(childrenBoxID, target);
		  }
		} else if(diff < 0) {
		  for (i = 0; i < Math.abs(diff); i ++) {
			$('#'+childrenBoxID).children().last().remove();
		  }
		}
	  });

	};

	/**
	 * EZ Logging/Warning (technically private but saving an '_' is worth it imo)
	 */
	Plugin.prototype.DLOG = function () {
	  if (!this.options.DEBUG || !console) return;
	  for (var i in arguments) {
		  console.log( PLUGIN_NS + ': ', arguments[i] );
	  }
	};

	Plugin.prototype.DWARN = function () {
		this.options.DEBUG  && console && console.warn( arguments );
	};

	$.fn[ PLUGIN_NS ] = function( methodOrOptions ) {
	  if (!$(this).length) {
		  return $(this);
	  }

	  var instance = $(this).data(PLUGIN_NS);

	  // CASE: action method (public method on PLUGIN class)
	  if ( instance
			  && methodOrOptions.indexOf('_') != 0
			  && instance[ methodOrOptions ]
			  && typeof( instance[ methodOrOptions ] ) == 'function' ) {

		  return instance[ methodOrOptions ]( Array.prototype.slice.call( arguments, 1 ) );

	  // CASE: argument is options object or empty = initialise
	  } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {

		  instance = new Plugin( $(this), methodOrOptions );    // ok to overwrite if this is a re-init
		  $(this).data( PLUGIN_NS, instance );
		  return $(this);

	  // CASE: method called before init
	  } else if ( !instance ) {
		  $.error( 'Plugin must be initialised before using method: ' + methodOrOptions );

	  // CASE: private method
	  } else if ( methodOrOptions.indexOf('_') == 0 ) {
		  $.error( 'Method ' +  methodOrOptions + ' is private!' );

	  // CASE: method does not exist
	  } else {
		  $.error( 'Method ' +  methodOrOptions + ' does not exist.' );
	  }
	};
  })(jQuery);
