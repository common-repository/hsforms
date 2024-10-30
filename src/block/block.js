/**
 * BLOCK: hsforms
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

//  Import CSS.
import './editor.scss';
import './style.scss';

const { __ } = wp.i18n; // Import __() from wp.i18n
const { dateI18n } = wp.date;
const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks
const {
    RichText,
    AlignmentToolbar,
    BlockControls,
    BlockAlignmentToolbar,
	InspectorControls,
} = wp.blockEditor;
const {
    Toolbar,
    Button,
    Tooltip,
    PanelBody,
    PanelRow,
	FormToggle,
	SelectControl,
	TextControl,
	Disabled,
	CheckboxControl,
	DateTimePicker,
	Dropdown,
	ToggleControl,
	ToolbarButton,
} = wp.components;

import { __experimentalGetSettings, date } from '@wordpress/date';
const { Component } = wp.element;
// for tp multi-select
import Select from 'react-select'
import makeAnimated from 'react-select/animated';
// to fetch tps
const { withSelect } = wp.data;

/**
 * Register: aa Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
registerBlockType( 'onm/block-hsforms', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __('Hsforms', 'wordpress-hsforms'), // Block title.
	icon: 'feedback', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'common', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__('hsforms', 'wordpress-hsforms'),
		__('hotelsuite', 'wordpress-hsforms'),
		__('onm', 'wordpress-hsforms'),
	],
	supports: { // Hey WP, I want to use your alignment toolbar!
        align: true,
    },
	attributes: {
		blockId: {
			type: 'string',
			default: null,
		},
		align: {
			type: 'string',
			default: null,
		},
		bookerType: {
			type: 'string',
			default: 'form',
		},
		ibeUrl: {
			type: 'string',
			default: onmGlobal.hsforms_options.ibe_link,
		},
		ibeCustomURL: {
			type: 'bool',
			default: false,
		},
		btnLabel: {
			type: 'string',
			default: onmGlobal.hsforms_options.button_label,
		},
		startDate: {
			type: 'string',
			default: null,
		},
		endDate: {
			type: 'string',
			default: null,
		},
		minNights: {
			type: 'integer',
			default: onmGlobal.hsforms_options.minimum_nights,
		},
		minAdults: {
			type: 'integer',
			default: onmGlobal.hsforms_options.minimum_adults,
		},
		maxAdults: {
			type: 'integer',
			default: onmGlobal.hsforms_options.maximum_adults,
		},
		minKinder: {
			type: 'integer',
			default: onmGlobal.hsforms_options.minimum_kinder,
		},
		maxKinder: {
			type: 'integer',
			default: onmGlobal.hsforms_options.maximum_kinder,
		},
		maxKinderAge: {
			type: 'integer',
			default: onmGlobal.hsforms_options.maximum_kinder_age,
		},
		minRooms: {
			type: 'integer',
			default: onmGlobal.hsforms_options.minimum_rooms,
		},
		maxRooms: {
			type: 'integer',
			default: onmGlobal.hsforms_options.maximum_rooms,
		},
		minPersons: {
			type: 'integer',
			default: onmGlobal.hsforms_options.minimum_persons,
		},
		maxPersons: {
			type: 'integer',
			default: onmGlobal.hsforms_options.maximum_persons,
		},
		tps: {
			type: 'array',
			default: []
		},
		ratecodes: {
			type: 'array',
			default: []
		},
		extps: {
			type: 'bool',
			default: false
		},
		minLOSBuffer: {
			type: 'bool',
			default: onmGlobal.hsforms_options.minlosbuffer,
		},
		daysAllowed: {
			type: 'array',
			default: onmGlobal.hsforms_options.days_allowed,
		},
		keepParams: {
			type: 'bool',
			default: onmGlobal.hsforms_options.keepParams,
		},
		allowedParams: {
			type: 'string',
			default: onmGlobal.hsforms_options.allowedParams,
		},
		promocode: {
			type: 'string',
			default: '',
		},
		promocodeFlag: {
			type: 'bool',
			default: onmGlobal.hsforms_options.promocodeFlag,
		},
		addRoomFlag: {
			type: 'bool',
			default: onmGlobal.hsforms_options.addRoomFlag,
		},
		ratecodeFlag: {
			type: 'bool',
			default: onmGlobal.hsforms_options.ratecodeFlag,
		},
		segmentFlag: {
			type: 'bool',
			default: onmGlobal.hsforms_options.segmentFlag,
		},
		legendFlag: {
			type: 'bool',
			default: onmGlobal.hsforms_options.legendFlag,
		},
		isButton: {
			type: 'bool',
			default: false
		},
		modalTitle: {
			type: 'string',
			default: onmGlobal.hsforms_options.modalTitle,
		},
		toastrClass: {
			type: 'string',
			default: onmGlobal.hsforms_options.toastrClass,
		},
		segments: {
			type: 'array',
			default: []
		}
	},

	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props props.
	 * @returns {Mixed} JSX Component.
	 */
	edit: class extends Component {
		//standard constructor for a component
		constructor() {
			super(...arguments);
			this.state = {
				startDateInField: '',
				endDateInField: '',
			};
		}

		componentDidMount() {
			this.updateStartEndDate();
		}

		updateStartEndDate() {
			// which startdate to show in backend input field
			if(this.props.attributes.tps != null) {
				if(this.props.attributes.tps.length > 0 && this.props.attributes.extps) {
					var _this = this;
					var tp_temp = new wp.api.models.Travelperiod( { id: this.props.attributes.tps[0].value } );
					tp_temp.fetch().done(function(tp) {
						var start = moment(tp.tp_start).endOf('day');
						var end = moment(tp.tp_end).endOf('day');
						var now = moment();
						let startDateInField = start.format( 'DD.MM.YYYY' );
						var endDateInField = moment(start).add( _this.props.attributes.minNights, 'days' ).format( 'DD.MM.YYYY' );
						if (end < now || moment(now).add( _this.props.attributes.minNights, 'days' ) > end) {
							endDateInField = 'Expired.';
							startDateInField = 'Expired.';
							_this.setState({startDate: now.toString()});
							_this.setState({endDate: moment(now).add( 1, 'years' ).toString()});
						} else if(start < now) {
							startDateInField = now.format( 'DD.MM.YYYY' );
							endDateInField = moment(now).add( _this.props.attributes.minNights, 'days' ).format( 'DD.MM.YYYY' )
							_this.setState({startDate: now.toString()});
						}
						_this.setState( { startDateInField:  startDateInField} );
						_this.setState( { endDateInField:  endDateInField} );
					});
				}
			}

			if(!this.props.attributes.extps) {
				var start = moment(this.props.attributes.startDate).endOf('day');
				var end = moment(this.props.attributes.endDate).endOf('day');
				var now = moment();
				let startDateInField = start.format( 'DD.MM.YYYY' );
				var endDateInField = moment(start).add( this.props.attributes.minNights, 'days' ).format( 'DD.MM.YYYY' );
				if (end < now || moment(now).add( this.props.attributes.minNights, 'days' ) > end) {
					endDateInField = 'Expired.';
					startDateInField = 'Expired.';
					this.props.setAttributes({startDate: now.toString()});
					this.props.setAttributes({endDate: moment(now).add( 1, 'years' ).toString()});
				} else if(start < now) {
					startDateInField = now.format( 'DD.MM.YYYY' );
					endDateInField = moment(now).add( this.props.attributes.minNights, 'days' ).format( 'DD.MM.YYYY' )
					this.props.setAttributes({startDate: now.toString()});
				}
				this.setState( { startDateInField: startDateInField } );
				this.setState( { endDateInField: endDateInField } );
			}
		}

		componentDidUpdate(prevProps, prevState) {
			if(prevProps.attributes.extps !== this.props.attributes.extps
				|| prevProps.attributes.tps !== this.props.attributes.tps
				|| prevProps.attributes.startDate !== this.props.attributes.startDate
				|| prevProps.attributes.endDate !== this.props.attributes.endDate) {
				this.updateStartEndDate();
			}
		}
		updateDaysAllowed(...args) {
			const tick = args[0];
			const index = args[1];
			const daysAllowed = this.props.attributes.daysAllowed;
			const updatedDaysAllowed = daysAllowed.map((val, i) => {
				if(i == index) {
					return (tick) ? 1 : 0;
				} else {
					return val;
				}
			});
			this.props.setAttributes({ daysAllowed: updatedDaysAllowed });
		}
		render() {
			if(!onmGlobal.hsforms_options.ibe_link) {
				// this looks like there are not default settings.
				const errorStyle = {
					color: 'red'
				  };
				return (
					<div>
						<p style={ errorStyle }>I think you forgot hsforms plugin settings.</p>
					</div>
				);
			}
			const animatedComponents = makeAnimated();
			const settings = __experimentalGetSettings();
			const is12HourTime = /a(?!\\)/i.test(
				settings.formats.time
					.toLowerCase() // Test only the lower case a
					.replace( /\\\\/g, '' ) // Replace "//" with empty strings
					.split( '' ).reverse().join( '' ) // Reverse the string and test for "a" not followed by a slash
			);
			// setting align as wide by default to show one linder horizontal booker
			if(this.props.attributes.align == null) {
				this.props.setAttributes({ align: "wide" });
			}
			if(this.props.attributes.blockId == null) {
				const post_id = wp.data.select("core/editor").getCurrentPostId();
				this.props.setAttributes({ blockId: post_id + "_" + Math.floor(Math.random() * 1000) });
			}
			if(this.props.attributes.startDate == null) {
				this.props.setAttributes({ startDate: dateI18n( 'F j, Y g:i a', Date.now()) });
			}
			if(this.props.attributes.endDate == null) {
				const proposedEndDate = moment( Date.now() ).add( this.props.attributes.minNights, 'days' ).format( 'Y-MM-DD' );
				this.props.setAttributes({ endDate: dateI18n( 'F j, Y g:i a', proposedEndDate ) });
			}
			// to stop the submit form for the backend
			const stopTheForm = function(e) {
				e.preventDefault();
			};

			// filling tps (custom post type = travelperiod)
			var allTps = [{label: 'Loading...', value: 0}];
			var travelperiods = wp.data.select( 'core' ).getEntityRecords( 'postType', 'travelperiod' );
			if(travelperiods) {
				allTps = [];
				travelperiods.forEach(tp => {
					allTps.push({label: tp.title.rendered, value: tp.id});
				});
			}

			// filling ratecodes (custom post type = ratecode)
			var allRCs = [{label: 'Loading...', value: 0}];
			var ratecodes = wp.data.select( 'core' ).getEntityRecords( 'postType', 'ratecode' );
			if(ratecodes) {
				allRCs = [];
				ratecodes.forEach(rc => {
					allRCs.push({label: rc.title.rendered, value: rc.id});
				});
			}

			// filling segments (custom post type = segment)
			var allSegments = [{label: 'Loading...', value: 0}];
			var segments = wp.data.select( 'core' ).getEntityRecords( 'postType', 'segment' );
			if(segments) {
				allSegments = [];
				segments.forEach(sg => {
					allSegments.push({label: sg.title.rendered, value: sg.id});
				});
			}

			let simpleTP = <div>
								<PanelRow>
									<span>{ __( 'Start Date', 'wordpress-hsforms' ) }</span>
									<Dropdown
										className="my-container-class-name"
										contentClassName="my-popover-content-classname"
										position="bottom right"
										renderToggle={ ( { isOpen, onToggle } ) => (
											<Button isLink onClick={ onToggle } aria-expanded={ isOpen }>
												{ date( 'Y-m-d', this.props.attributes.startDate ) }
											</Button>
										) }
										renderContent={ () => (
											<DateTimePicker
												currentDate={ this.props.attributes.startDate }
												onChange={ ( startDate ) => this.props.setAttributes( { startDate } ) }
												is12Hour={ is12HourTime }
											/>
										) }
									/>
								</PanelRow>
								<PanelRow>
									<span>{ __( 'End Date', 'wordpress-hsforms' ) }</span>
									<Dropdown
										className="my-container-class-name"
										contentClassName="my-popover-content-classname"
										position="bottom right"
										renderToggle={ ( { isOpen, onToggle } ) => (
											<Button isLink onClick={ onToggle } aria-expanded={ isOpen }>
												{ date( 'Y-m-d', this.props.attributes.endDate ) }
											</Button>
										) }
										renderContent={ () => (
											<DateTimePicker
												currentDate={ this.props.attributes.endDate }
												onChange={ ( endDate ) => this.props.setAttributes( { endDate } ) }
												is12Hour={ is12HourTime }
											/>
										) }
									/>
								</PanelRow>
							</div>;
			if (this.props.attributes.extps)
				simpleTP = <Disabled>{ simpleTP }</Disabled>;

			// daysAllowed checkboxes
			var daysInWeek = [__('Monday', 'wordpress-hsforms'), __('Tuesday', 'wordpress-hsforms'), __('Wednesday', 'wordpress-hsforms'), __('Thursday', 'wordpress-hsforms'), __('Friday', 'wordpress-hsforms'), __('Saturday', 'wordpress-hsforms'), __('Sunday', 'wordpress-hsforms')];
			var daysCheckboxes = [];
			daysInWeek.forEach((val, index) => {
				daysCheckboxes.push(
					<CheckboxControl
						label = { val }
						checked={ !! this.props.attributes.daysAllowed[index] ? this.props.attributes.daysAllowed[index] : 0 }
						onChange={ tick => this.updateDaysAllowed(tick, index) }
					/>
				);
			});

			// rooms array to render form
			let minRooms = Array.apply(null, Array(parseInt(this.props.attributes.minRooms)));
			minRooms = minRooms.map(function (x, i) { return (i+1) });

			return (
				<div>
					{
						<BlockControls>
							<Toolbar>
								<ToolbarButton
									icon='image-rotate-left'
									title={ this.props.attributes.isButton ? __('Convert to form', 'wordpress-hsforms') : __('Convert to button', 'wordpress-hsforms') }
									onClick={ () => {
										this.props.setAttributes({ isButton: ! this.props.attributes.isButton })
									} }
								/>
							</Toolbar>
						</BlockControls>
					}
					<InspectorControls>
						<PanelBody
							title={ __( 'Display', 'wordpress-hsforms' ) }
							initialOpen={ true }
						>
							<Disabled>
								<TextControl
									label={__("Block ID", "wordpress-hsforms")}
									value={ this.props.attributes.blockId }
									onChange={ ( blockId ) => this.props.setAttributes( { blockId } ) }
								/>
							</Disabled>
							<TextControl
								label={__("Button Label", "wordpress-hsforms")}
								value={ this.props.attributes.btnLabel }
								onChange={ ( btnLabel ) => this.props.setAttributes( { btnLabel } ) }
							/>
							{ this.props.attributes.isButton &&
								<TextControl
									label={ __("Modal Title", "wordpress-hsforms") }
									value={ this.props.attributes.modalTitle }
									onChange={ ( modalTitle ) => this.props.setAttributes( { modalTitle } ) }
								/>
							}
							{ this.props.attributes.ibeCustomURL ?
								<TextControl
									label={__("IBE URL", "wordpress-hsforms")}
									value={ this.props.attributes.ibeUrl }
									onChange={ ( ibeUrl ) => this.props.setAttributes( { ibeUrl } ) }
								/>
								:
								<div>
									<Disabled>
										<TextControl
											label={__("IBE URL", "wordpress-hsforms")}
											value={ onmGlobal.hsforms_options.ibe_link }
											onChange={ ( ibeUrl ) => this.props.setAttributes( { ibeUrl } ) }
										/>
									</Disabled>
								</div>
							}
							<CheckboxControl
								label={__("Override default IBE URL", "wordpress-hsforms")}
								help={__("Default IBE URL can be changed in Hsforms plugin settings.", "wordpress-hsforms")}
								checked={ this.props.attributes.ibeCustomURL }
								onChange={ ( ibeCustomURL ) => this.props.setAttributes( { ibeCustomURL } ) }
							/>
							<TextControl
								label={__("Toastr class", "wordpress-hsforms")}
								value={ this.props.attributes.toastrClass }
								onChange={ ( toastrClass ) => this.props.setAttributes( { toastrClass } ) }
							/>
						</PanelBody>
						<PanelBody
							title={ __( 'Travel Period', 'wordpress-hsforms' ) }
							initialOpen={ false }
						>
							{ simpleTP }
							<PanelRow>
								<ToggleControl
									label={ __("Extended TravelPeriods?", "wordpress-hsforms") }
									help={ this.props.attributes.extps ? __('You can select multiple TravelPeriods', 'wordpress-hsforms') : '' }
									checked={ this.props.attributes.extps }
									onChange={ () => this.props.setAttributes( { extps: ! this.props.attributes.extps } ) }
								/>
							</PanelRow>
							{ this.props.attributes.extps &&
								<div>
									<PanelRow>
										<span>{ __('Select TravelPeriods', 'wordpress-hsforms') }</span>
									</PanelRow>
									<PanelRow>
										<Select
											options={ allTps }
											value={ this.props.attributes.tps }
											onChange={ ( values ) => this.props.setAttributes( { tps: values } ) }
											name={ __("TravelPeriods", "wordpress-hsforms") }
											components={ animatedComponents }
											isMulti
											className="tp-multi-select"
											classNamePrefix="select"
										/>
									</PanelRow>
								</div>
							}
							<PanelRow>
								<ToggleControl
									label={ __('minLOS Buffer', 'wordpress-hsforms') }
									help={ this.props.attributes.minLOSBuffer ? __('minLOS Buffer will not be added in travelperiod', 'wordpress-hsforms') : __('minLOS Buffer will be added in travelperiod', 'wordpress-hsforms') }
									checked={ this.props.attributes.minLOSBuffer }
									onChange={ ( minLOSBuffer ) => this.props.setAttributes( { minLOSBuffer: minLOSBuffer } ) }
								/>
							</PanelRow>
						</PanelBody>
						<PanelBody
							title={__("Days Allowed", "wordpress-hsforms")}
							initialOpen={ false }
						>
							{ daysCheckboxes }
						</PanelBody>
						<PanelBody
							title={ __( 'Min-Max Restrictions', 'wordpress-hsforms' ) }
							initialOpen={ false }
						>
							<TextControl
								label={__("Minimum Nights", "wordpress-hsforms")}
								value={ this.props.attributes.minNights }
								type="number"
								onChange={ ( minNights ) => this.props.setAttributes( { minNights: parseInt( minNights ) } ) }
							/>
							<TextControl
								label={__("Minimum Adults", "wordpress-hsforms")}
								value={ this.props.attributes.minAdults }
								type="number"
								onChange={ ( minAdults ) => this.props.setAttributes( { minAdults: (parseInt( minAdults ) >= 1) ? parseInt( minAdults ) : 1 } ) }
							/>
							<TextControl
								label={__("Maximum Adults", "wordpress-hsforms")}
								value={ this.props.attributes.maxAdults }
								type="number"
								onChange={ ( maxAdults ) => this.props.setAttributes( { maxAdults: parseInt( maxAdults ) } ) }
							/>
							<TextControl
								label={__("Minimum Kinder", "wordpress-hsforms")}
								value={ this.props.attributes.minKinder }
								type="number"
								onChange={ ( minKinder ) => this.props.setAttributes( { minKinder: (parseInt( minKinder ) >= 0) ? parseInt( minKinder ) : 0 } ) }
							/>
							<TextControl
								label={__("Maximum Kinder", "wordpress-hsforms")}
								value={ this.props.attributes.maxKinder }
								type="number"
								onChange={ ( maxKinder ) => this.props.setAttributes( { maxKinder: parseInt( maxKinder ) } ) }
							/>
							<TextControl
								label={__("Maximum Kinder Age", "wordpress-hsforms")}
								value={ this.props.attributes.maxKinderAge }
								type="number"
								onChange={ ( maxKinderAge ) => this.props.setAttributes( { maxKinderAge: parseInt( maxKinderAge ) } ) }
							/>
							<TextControl
								label={__("Minimum Rooms", "wordpress-hsforms")}
								value={ this.props.attributes.minRooms }
								type="number"
								onChange={ ( minRooms ) => this.props.setAttributes( { minRooms: (parseInt( minRooms ) >= 1) ? parseInt( minRooms ) : 1  } ) }
							/>
							<TextControl
								label={__("Maximum Rooms", "wordpress-hsforms")}
								value={ this.props.attributes.maxRooms }
								type="number"
								onChange={ ( maxRooms ) => this.props.setAttributes( { maxRooms: parseInt( maxRooms ) } ) }
							/>
							<TextControl
								label={__("Minimum Persons", "wordpress-hsforms")}
								value={ this.props.attributes.minPersons }
								type="number"
								onChange={ ( minPersons ) => this.props.setAttributes( { minPersons: (parseInt( minPersons ) >= 1) ? parseInt( minPersons ) : 1  } ) }
							/>
							<TextControl
								label={__("Maximum Persons", "wordpress-hsforms")}
								value={ this.props.attributes.maxPersons }
								type="number"
								onChange={ ( maxPersons ) => this.props.setAttributes( { maxPersons: parseInt( maxPersons ) } ) }
							/>
							<ToggleControl
								label={ __('Show Add Room Link?', 'wordpress-hsforms') }
								help={ this.props.attributes.addRoomFlag ? __('Add Room link will be shown', 'wordpress-hsforms') : __('Add Room link will be hidden', 'wordpress-hsforms') }
								checked={ this.props.attributes.addRoomFlag }
								onChange={ ( addRoomFlag ) => this.props.setAttributes( { addRoomFlag: addRoomFlag } ) }
							/>
						</PanelBody>
						<PanelBody
							title={ __( 'Query Parameters', 'wordpress-hsforms') }
							initialOpen={ false }
						>
							<PanelRow>
								<ToggleControl
									label={ __("Keep Parameters?", "wordpress-hsforms") }
									help={ this.props.attributes.keepParams ? __('Query Parameters will be sent to IBE', 'wordpress-hsforms') : '' }
									checked={ this.props.attributes.keepParams }
									onChange={ () => this.props.setAttributes( { keepParams: ! this.props.attributes.keepParams } ) }
								/>
							</PanelRow>
							<PanelRow>
								<TextControl
									label={ __("Allowed Parameters", "wordpress-hsforms") }
									value={ this.props.attributes.allowedParams }
									onChange={ ( allowedParams ) => this.props.setAttributes( { allowedParams: allowedParams } ) }
								/>
							</PanelRow>
						</PanelBody>
						<PanelBody
							title={ __( 'Optional Fields', 'wordpress-hsforms') }
							initialOpen={ false }
						>
							<ToggleControl
								label={ __("Show Promotion Code to User?", "wordpress-hsforms") }
								help={ this.props.attributes.promocodeFlag ? __('Promotion Code will be shown to the user as input field', 'wordpress-hsforms') : 'Promotion Code will be in the form as a hidden field' }
								checked={ this.props.attributes.promocodeFlag }
								onChange={ () => this.props.setAttributes( { promocodeFlag: ! this.props.attributes.promocodeFlag } ) }
							/>
							<TextControl
								label={ __("Web Promotion Code for Block Reservations", "wordpress-hsforms") }
								value={ this.props.attributes.promocode }
								onChange={ ( promocode ) => this.props.setAttributes( { promocode: promocode } ) }
							/>
							<PanelRow>
								<span>{ __('Select RateCodes', 'wordpress-hsforms') }</span>
							</PanelRow>
							<PanelRow>
								<Select
									options={ allRCs }
									value={ this.props.attributes.ratecodes }
									onChange={ ( values ) => this.props.setAttributes( { ratecodes: values } ) }
									name={ __("RateCodes", "wordpress-hsforms") }
									components={ animatedComponents }
									isMulti
									className="tp-multi-select"
									classNamePrefix="select"
								/>
							</PanelRow>
							<PanelRow>
								<ToggleControl
									label={ __("Show Ratecodes?", "wordpress-hsforms") }
									help={ this.props.attributes.ratecodeFlag ? __('Ratecodes will be sent to the IBE', 'wordpress-hsforms') : 'Ratecodes will not be sent to the IBE' }
									checked={ this.props.attributes.ratecodeFlag }
									onChange={ () => this.props.setAttributes( { ratecodeFlag: ! this.props.attributes.ratecodeFlag } ) }
								/>
							</PanelRow>
							<PanelRow>
								<span>{ __('Select Segments', 'wordpress-hsforms') }</span>
							</PanelRow>
							<PanelRow>
								<Select
									options={ allSegments }
									value={ this.props.attributes.segments }
									onChange={ ( values ) => this.props.setAttributes( { segments: values } ) }
									name={ __("Segments", "wordpress-hsforms") }
									components={ animatedComponents }
									isMulti
									className="tp-multi-select"
									classNamePrefix="select"
								/>
							</PanelRow>
							<PanelRow>
								<ToggleControl
									label={ __("Show Segments?", "wordpress-hsforms") }
									help={ this.props.attributes.segmentFlag ? __('Segments will be shown to the user', 'wordpress-hsforms') : 'Segments will not be shown to the user and will not be sent to the IBE.' }
									checked={ this.props.attributes.segmentFlag }
									onChange={ () => this.props.setAttributes( { segmentFlag: ! this.props.attributes.segmentFlag } ) }
								/>
							</PanelRow>
						</PanelBody>
						<PanelBody
							title={ __( 'API settings', 'wordpress-hsforms') }
							initialOpen={ false }
						>
							<PanelRow>
								<ToggleControl
									label={ __("Show Legends?", "wordpress-hsforms") }
									help={ this.props.attributes.legendFlag ? __('Legends will be shown to the user', 'wordpress-hsforms') : __('Legends will not be shown to the user.', 'wordpress-hsforms') }
									checked={ this.props.attributes.legendFlag }
									onChange={ () => this.props.setAttributes( { legendFlag: ! this.props.attributes.legendFlag } ) }
								/>
							</PanelRow>
						</PanelBody>
					</InspectorControls>
					{ ! this.props.attributes.isButton
						?
						<div className="hsforms" id={ "tx-hsforms-form-" + this.props.attributes.blockId }>
							<div className="preview">Preview</div>
							{ this.props.attributes.bookerType === 'button' &&
								<div>
									<input type="submit" value={ this.props.attributes.btnLabel } />
								</div>
							}
							<form className="booking-form" method="get" target='_blank'>
							</form>
							{ this.props.attributes.bookerType === 'form' &&
								<div className="hsforms-backend">
									<form className="bookingFormUI" onSubmit={ stopTheForm } >
										<div className="rooms">
											<div class="room-rows">
												{ minRooms.map((v, i) => {
													return (
														<div className="room-row">
															<div className="dates box">
																<div className="hsforms__item">
																	<label htmlFor="date1">{ __('From:', 'wordpress-hsforms') }</label> <br/>
																	<input type="text" name="date1" id={ "input_de"+v+"-" + this.props.attributes.blockId } className="date1 hsdate hs-field" value={ this.state.startDateInField } />
																</div>
																<div className="hsforms__item">
																	<label htmlFor="date2">{ __('To:', 'wordpress-hsforms') }</label> <br/>
																	<input type="text" name="date2" id={ "input_de_to"+v+"-" + this.props.attributes.blockId } className="date2 hsdate hs-field" value={ this.state.endDateInField } />
																</div>
															</div>
															<div className="booker-in-content"></div>
															<div className="persons box">
																{ this.props.attributes.maxAdults > 0 &&
																	<div className="hsforms__item">
																		<label htmlFor="">{__('Adults:', 'wordpress-hsforms')}</label> <br/>
																		<input type="number" name="adults" value={ this.props.attributes.minAdults } min={ this.props.attributes.minAdults } max={ this.props.attributes.maxAdults } className="hs-field adults" />
																	</div>
																}
																{ this.props.attributes.maxKinder > 0 &&
																	<div className="hsforms__item">
																		<label htmlFor="">{__('Kinder:', 'wordpress-hsforms')}</label> <br/>
																		<input type="number" name="children" id={ "children"+v+"-" + this.props.attributes.blockId } data-children-box-id={ "children-box-" + this.props.attributes.blockId + "-"+v } value={ this.props.attributes.minKinder } min={ this.props.attributes.minKinder } max={ this.props.attributes.maxKinder } className="children hs-field" />
																	</div>
																}
															</div>
															<div className="clear"></div>
														</div>
													);
												})}
											</div>
											<div className="hsforms__item submit">
												<input type="submit" value={ this.props.attributes.btnLabel } />
											</div>
										</div>
									</form>
								</div>
							}
						</div>
						:
						<div className="hsforms" id={ "tx-hsforms-form-" + this.props.attributes.blockId }>
							<div className="preview">{__('Preview', 'wordpress-hsforms')}</div>
							<div className="hsforms-backend">
								<form className="bookingFormUI" onSubmit={ stopTheForm } >
									<div className="hsforms__item submit">
										<input type="submit" value={ this.props.attributes.btnLabel } />
									</div>
								</form>
							</div>
						</div>
					}
				</div>
			);
		}
	},
	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props props.
	 * @returns {Mixed} JSX Frontend HTML.
	 */
	save: () => {
		return null;
	},
} );
