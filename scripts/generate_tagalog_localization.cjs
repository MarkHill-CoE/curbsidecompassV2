const fs = require('fs');
const path = require('path');

// Load original English dictionary
const enPath = path.resolve(__dirname, '../src/locales/en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

console.log(`Original English keys loaded: ${Object.keys(en).length}`);

// We will construct tl (Tagalog) and backEn (Back-translated English) dictionaries
const tl = {};
const backEn = {};

function add(key, tagalogText, backEnglishText) {
  if (!en[key]) {
    console.warn(`Warning: key "${key}" does not exist in en.json!`);
  }
  tl[key] = tagalogText;
  backEn[key] = backEnglishText || en[key];
}

// ==========================================
// 1. CORE BADGES & SKIP LINKS
// ==========================================
add('OCCUPIED', 'MAY NAKAPARADA', 'OCCUPIED');
add('VACANT', 'BAKANTE', 'VACANT');
add('skip_to_q1_link', 'Lumaktaw sa Tanong 1', 'Skip to Question 1');

// ==========================================
// 2. NAVIGATION BUTTONS & ALERTS
// ==========================================
add('nav_btn_previous', 'Nakaraan', 'Previous');
add('nav_btn_next', 'Susunod', 'Next');
add('nav_alert_select_option', 'Mangyaring pumili ng opsyon upang magpatuloy.', 'Please select an option to advance.');
add('nav_alert_postal_format', 'Mangyaring maglagay ng wastong 6-character na postal code ng Edmonton (hal. T5J 0K1) o pumili ng kapitbahayan sa ibaba.', 'Please enter a valid 6-character Edmonton postal code (e.g. T5J 0K1) or select a neighbourhood below.');
add('nav_btn_back_to_location', 'Bumalik sa Lokasyon', 'Back to Location');
add('nav_btn_confirm_layout', 'Kumpirmahin ang Ayos ng Kalsada', 'Confirm Street Layout');
add('nav_btn_proceed_q1', 'Magpatuloy sa Tanong 1', 'Proceed to Question 1');
add('nav_btn_calc_persona', 'Kalkulahin ang Aking Persona', 'Calculate My Persona');

// ==========================================
// 3. HEADER & GLOBAL CONTROLS
// ==========================================
add('header_logo_alt', 'Opisyal na logo ng Lungsod ng Edmonton', 'City of Edmonton official logo');
add('header_title_curbside', 'Curbside', 'Curbside');
add('header_title_compass', 'Compass', 'Compass');
add('header_how_it_works_title', 'Buksan ang interactive onboarding guide kung paano gumagana ang Curbside Compass', 'Open interactive onboarding guide on how Curbside Compass works');
add('header_how_it_works', 'Paano Ito Gumagana', 'How It Works');
add('header_mode_simplified', 'Lumipat sa Pinapayak na Static View (Mababang Paggalaw)', 'Switch to Simplified Static View (Low Motion)');
add('header_mode_live', 'Lumipat sa Live Animated 3D Simulation', 'Switch to Live Animated 3D Simulation');
add('header_live_trend', 'Kasalukuyang Trend:', 'Live Trend:');
add('header_final_persona', 'Huling Persona:', 'Final Persona:');
add('header_retake_btn', 'Ulitin', 'Retake');
add('header_reset_btn', 'I-reset', 'Reset');

// ==========================================
// 4. COMPASS AXES & LABELS
// ==========================================
add('compass_badge_your_result', 'Ang Iyong Resulta', 'Your Result');
add('compass_top_axis', '▲ Reguladong Pamamahala', '▲ Regulated Management');
add('compass_bottom_axis', '▼ Bukas na Pag-access', '▼ Open Access');
add('compass_left_axis_line1', '◀ Pinondohan ng', '◀ Taxpayer');
add('compass_left_axis_line2', 'Nagbabayad ng Buwis', 'Funded');
add('compass_right_axis_line1', 'Bayad ng Gumagamit', 'User-Fee');
add('compass_right_axis_line2', 'Pinondohan ▶', 'Funded ▶');
add('compass_q1_line1', 'Regulado', 'Regulated');
add('compass_q1_line2', 'Bayad ng Gumagamit', 'User-Fee');
add('compass_q2_line1', 'Protektibo', 'Protective');
add('compass_q2_line2', 'Nagbabayad ng Buwis', 'Taxpayer');
add('compass_q3_line1', 'Libre at Madali', 'Free & Easy');
add('compass_q3_line2', 'Bukas na Pag-access', 'Open Access');
add('compass_q4_line1', 'Flat Rate', 'Flat Rate');
add('compass_q4_line2', 'Simpleng Bayad', 'Simple Fee');

// ==========================================
// 5. DRAWER & GAUGE CONTROLS
// ==========================================
add('drawer_sliders_title', 'Manu-manong Simulation Sliders', 'Manual Simulation Sliders');
add('drawer_sliders_subtitle', 'Isaayos ang mga parameter ng kapitbahayan sa ibaba upang galugarin ang mga alternatibong sitwasyon sa paradahan.', 'Adjust neighbourhood parameters below to explore alternative parking scenarios.');
add('drawer_dwellings_unit', 'mga tirahan', 'dwellings');
add('drawer_infill_label', 'Density ng Infill', 'Infill Density');
add('drawer_view_gauge_btn', 'Tingnan ang Gauge', 'View Gauge');
add('drawer_back_survey_btn', 'Bumalik sa Parking Survey', 'Back to Parking Survey');
add('drawer_police_test_btn', 'Subukan ang Tugon ng Pulisya ng EPS', 'Test EPS Police Response');
add('drawer_police_test_title', 'Gayahin ang pagbara ng kalsada na nagdudulot ng opisyal na clearing ng cruiser ng pulisya ng EPS', 'Simulate a road blockage triggering official EPS police cruiser clearing');
add('drawer_circling_label', 'Umiikot na Trapiko', 'Circling Traffic');
add('drawer_circling_text', 'Umiikot para sa Paradahan', 'Circling for Parking');
add('drawer_smooth_flow', 'Maayos ang Daloy ng Trapiko', 'Smooth Traffic Flow');

add('gauge_drawer_title', 'Pagsusuri sa Curbside Parking Gauge', 'Curbside Parking Gauge Analysis');
add('gauge_drawer_subtitle', 'Live na pagtataya ng demand sa paradahan sa tabing-kalsada kumpara sa legal na kapasidad ng stall para sa 12 bahay ng Edmonton.', 'Live forecast of curbside parking demand versus legal stall capacity for 12 Edmonton homes.');
add('gauge_curb_availability_label', 'Kakayahang Magamit ng Curbside', 'Curb Availability');
add('gauge_active_demand_label', 'Aktibong Demand:', 'Active Demand:');
add('gauge_circling_cars_label', 'Umiikot na Sasakyan:', 'Circling Cars:');
add('gauge_cruising_label', 'Umiikot sa kalsada na naghahanap ng paradahan', 'Cruising street searching for parking');
add('gauge_smooth_label', 'Maayos ang daloy sa kalsada; may mga bakanteng stall', 'Street flowing smoothly; stalls open');
add('gauge_dwellings_label', 'Bilang ng Tirahan:', 'Dwellings Represented:');
add('gauge_homes_block_label', '12 bahay / bloke ng kapitbahayan', '12 homes / neighbourhood block');
add('gauge_stalls_free', 'mga libreng stall', 'stalls free');
add('gauge_deficit_prefix', 'Kulang ng', 'Short');
add('gauge_deficit_suffix', 'mga puwang', 'spaces');
add('gauge_occupied_of', 'ng', 'of');
add('gauge_occupied_suffix', 'mga stall ang nagamit', 'stalls occupied');
add('gauge_res_abbr', 'res', 'res');
add('gauge_vis_abbr', 'bisita', 'vis');
add('gauge_status_healthy', 'MABUTING AVAILABILITY', 'HEALTHY AVAILABILITY');
add('gauge_status_strained', 'NAIIPIT ANG CURBSIDE', 'CURBSIDE STRAINED');
add('gauge_status_critical', 'KRITIKAL NA KAKULANGAN SA PARADAHAN', 'CRITICAL PARKING DEFICIT');
add('gauge_insight_healthy_title', 'Balanse ang Paradahan:', 'Balanced Parking:');
add('gauge_insight_healthy_desc', 'Sapat na mga bakanteng stall para sa mga residente, bisita, at mga van ng paghahatid.', 'Adequate open stalls for residents, visitors, and delivery vans.');
add('gauge_insight_strained_title', 'Mataas na Occupancy:', 'High Occupancy:');
add('gauge_insight_strained_desc', 'Umaabot ang curbside sa ~85% occupancy. May bahagyang pag-ikot sa mga oras ng mataas na demand.', 'Curb reaches ~85% occupancy. Minor cruising occurs during peak demand periods.');
add('gauge_insight_critical_title', 'Matinding Kakulangan sa Curbside:', 'Severe Curb Deficit:');
add('gauge_insight_critical_desc', 'Lumampas ang demand ng sasakyan sa mga legal na espasyo. Ang umiikot na trapiko ay nagdudulot ng mga pagbara at polusyon.', 'Vehicle demand exceeds legal spaces. Circling traffic causes blockages and emissions.');
add('gauge_adjust_sliders_btn', 'Isaayos ang mga Slider', 'Adjust Sliders');
add('gauge_back_survey_btn', 'Bumalik sa Parking Survey', 'Back to Parking Survey');

// ==========================================
// 6. SIMULATION LABELS
// ==========================================
add('sim_cars_home_label', 'Mga Kotse Bawat Bahay:', 'Cars Per Home:');
add('sim_visitor_passes_label', 'Mga Pass sa Bisita:', 'Visitor Passes:');
add('sim_deliveries_label', 'Lingguhang Paghahatid:', 'Weekly Deliveries:');

// ==========================================
// 7. STATIC / LOW MOTION VIEW
// ==========================================
add('static_header_title', 'Pinapayak na Buod ng Kalsada', 'Simplified Street Summary');
add('static_header_live_sim_btn', 'Live Simulation', 'Live Simulation');
add('static_header_live_sim_title', 'Bumalik sa buong animated na 3D simulation', 'Return to full animated 3D simulation');
add('static_status_overcrowded_label', 'SOBRANG SIKIP', 'OVERCROWDED');
add('static_status_overcrowded_desc', 'Lumampas ang demand sa legal na kapasidad ng curbside. Umiikot ang mga sasakyan para sa mga puwang.', 'Demand exceeds legal curbside capacity. Vehicles circle for spots.');
add('static_status_near_capacity_label', 'HALOS PUNO NA', 'NEAR CAPACITY');
add('static_status_near_capacity_desc', 'Halos puno na ang curbside. Limitado ang turnover para sa mga bisita at courier.', 'Curbside nearly full. Limited turnover for visitors and couriers.');
add('static_status_balanced_label', 'BALANSENG AVAILABILITY', 'BALANCED AVAILABILITY');
add('static_status_balanced_desc', 'Pinakamainam na paradahan sa kalsada na may mga bakanteng puwang para sa mga bisita at van ng paghahatid.', 'Optimal street parking with open spots for visitors and delivery vans.');
add('static_slider_label', 'Kasalukuyang Antas ng Demand sa Curbside:', 'Current Curbside Demand Level:');
add('static_slider_aria_label', 'Demand sa Curbside Parking', 'Curbside Parking Demand');
add('static_slider_cars_unit', 'mga kotse', 'cars');
add('static_slider_cap_unit', 'kapasidad ng stall', 'stall capacity');
add('static_tick_0', '0%', '0%');
add('static_tick_ideal', '85% Tamang Target', '85% Ideal Target');
add('static_tick_max', '100% Legal na Limitasyon', '100% Legal Limit');
add('static_tick_overload', '200% Sobrang Pag-apaw', '200% Spillover');
add('static_summary_prefix', 'Ipinapakita ng kasalukuyang senaryo', 'Current scenario shows');
add('static_summary_open_suffix', 'mga bakanteng legal na stall sa kalsada.', 'open legal street stalls.');
add('static_summary_over_suffix', 'mga sasakyan na lampas sa legal na kapasidad ng curbside.', 'vehicles beyond legal curbside capacity.');
add('static_circling_none', 'Walang sasakyang umiikot para sa paradahan; maayos ang daloy ng trapiko.', 'No vehicles circling for parking; through traffic flows smoothly.');
add('static_circling_single', '1 sasakyan ang umiikot sa bloke na naghahanap ng bakanteng stall.', '1 vehicle is circling the block searching for an open stall.');
add('static_circling_plural', 'mga sasakyan ang umiikot sa bloke na naghahanap ng bakanteng stall.', 'vehicles are circling the block searching for an open stall.');
add('static_circling_active', 'Umiikot na Trapiko:', 'Circling Traffic:');
add('static_stalls_occupied_of', 'ng', 'of');
add('static_stalls_occupied_suffix', 'mga legal na stall sa kalsada ang nagamit', 'legal street stalls occupied');
add('static_acc_offstreet_title', 'Pribado at Off-Street na Paradahan', 'Private & Off-Street Parking');
add('static_acc_garages_label', 'Mga Garahe sa Likod-Bahay:', 'Detached Rear Garages:');
add('static_acc_garages_occupied', 'nagamit', 'occupied');
add('static_acc_garages_vacant', 'bakante', 'vacant');
add('static_acc_offstreet_garages_full', 'Puno ang mga garahe; ang labis na paradahan ay lumilipat sa mga driveway pad at curbside.', 'Garages are full; overflow parking shifts onto driveway pads and curbside.');
add('static_acc_assumptions_title', 'Mga Ipinagpapalagay sa Kapitbahayan ng Edmonton', 'Edmonton Neighbourhood Assumptions');
add('static_acc_cars_label', 'Average na Pagmamay-ari ng Kotse sa Bahay:', 'Average Household Car Ownership:');
add('static_acc_cars_suffix', 'mga kotse bawat tirahan', 'cars per dwelling');
add('static_acc_visitors_label', 'Mga Pangangailangan sa Paradahan ng Bisita:', 'Visitor Parking Demand:');
add('static_acc_visitors_suffix', 'mga pass bawat bahay', 'passes per home');
add('static_acc_deliveries_label', 'Lingguhang Paghahatid ng Courier at Package:', 'Weekly Courier & Package Deliveries:');
add('static_acc_deliveries_suffix', 'bawat linggo sa buong bloke', 'per week across block');
add('static_btn_switch_livesim', 'Lumipat sa Live Simulation', 'Switch to Live Simulation');
add('static_btn_switch_livesim_title', 'I-explore ang dynamic na 3D city simulation na may animated na trapiko', 'Explore dynamic 3D city simulation with animated traffic');
add('static_btn_customize_livesim_title', 'I-customize ang mga slider na ito sa loob ng live na 3D animated simulation', 'Customize these sliders inside the live 3D animated simulation');

// ==========================================
// 8. ONBOARDING INTRO TOUR (CivicOnboardingModal)
// ==========================================
add('intro_btn_close_title', 'Isara ang Onboarding Tour', 'Close Onboarding Tour');
add('intro_btn_close_aria', 'Isara ang Gabay', 'Close Guide');
add('intro_header_title', 'Gabay sa Curbside Compass', 'Curbside Compass Guide');
add('intro_header_subtitle', 'Mabilis na 5-Hakbang na Interactive Walkthrough', 'Quick 5-Step Interactive Walkthrough');
add('intro_step_label', 'Hakbang', 'Step');
add('intro_screen_counter_label', 'Screen', 'Screen');
add('intro_screen_counter_of', 'ng', 'of');
add('intro_btn_skip_title', 'Direktang pumunta sa pagsusuri ng paradahan', 'Jump straight to the parking survey');
add('intro_btn_skip_aria', 'Lumaktaw sa Survey', 'Skip to Survey');
add('intro_btn_skip', 'Lumaktaw sa Survey', 'Skip to Survey');
add('intro_btn_back', 'Bumalik', 'Back');
add('intro_btn_next', 'Susunod na Hakbang', 'Next Step');
add('intro_btn_start', 'Simulan ang Curbside Compass', 'Start Curbside Compass');

add('intro_s1_title', 'Maligayang Pagdating sa Curbside Compass!', 'Welcome to Curbside Compass!');
add('intro_s1_subtitle', 'Ang Iyong Boses sa Patakaran sa Paradahan ng Edmonton', 'Your Voice in Edmonton Parking Policy');
add('intro_s1_body1', 'Tinutulungan ka ng interactive na tool na ito na galugarin kung paano hinuhubog ng mga desisyon sa paradahan ang iyong kapitbahayan sa Edmonton.', 'This interactive tool helps you explore how parking decisions shape your Edmonton neighbourhood.');
add('intro_s1_body2', 'Habang sinasagot mo ang 9 na mabilis na tanong sa patakaran, panoorin ang animated na modelo ng kalsada na agad na tumutugon sa iyong mga pagpipilian.', 'As you answer 9 quick policy questions, watch the animated street model respond to your choices in real time.');
add('intro_s1_privacy', 'Hindi kinakailangan ang personal na impormasyon. Ang iyong mga tugon ay hindi nagpapakilala.', 'No personal information required. Your responses are anonymous.');

add('intro_s2_title', 'Ang Kalsada: Isang Nakabahaging Espasyo', 'The Street: A Shared Resource');
add('intro_s2_curb_title', 'Curbside Parking (Mga Stall sa Kalsada):', 'Curbside Parking (On-Street Stalls):');
add('intro_s2_curb_desc', 'Nakabahaging espasyo para sa mga residente, bisita, manggagawa sa kalakalan, at mga van ng paghahatid.', 'Shared public space for residents, visitors, tradespeople, and delivery vans.');
add('intro_s2_garages_title', 'Mga Garahe at Driveway (Off-Street):', 'Garages & Driveways (Off-Street):');
add('intro_s2_garages_desc', 'Pribadong paradahan sa likod ng eskinita o mga driveway sa harap na nagpapalaya ng espasyo sa kalsada.', 'Private rear alley parking or front driveways that free up curb space.');
add('intro_s2_takeaway', 'Kapag napuno ang curbside, umiikot ang mga sasakyan na nagdudulot ng trapiko, ingay, at pagkaantala sa paghahatid.', 'When the curb fills up, vehicles circle causing traffic, noise, and delivery delays.');

add('intro_s3_title', 'Paano Gumagana ang Curbside Gauge', 'How the Curbside Gauge Works');
add('intro_s3_body1', 'Sinusubaybayan ng dial gauge ang live na demand sa paradahan laban sa legal na kapasidad ng stall ng iyong kalsada:', 'The dial gauge tracks live parking demand against your street\'s legal stall capacity:');
add('intro_s3_body2', 'Berdeng Sona (0-85%): Maraming bakanteng puwang; maayos ang daloy ng trapiko. Dilaw na Sona (85-100%): Malapit sa kapasidad; nagsisimulang umikot ang mga sasakyan. Pulang Sona (100%+): Kakulangan sa paradahan; siksikan at pagbara sa kalsada.', 'Green Zone (0-85%): Plenty of open spaces; traffic flows smoothly. Yellow Zone (85-100%): Near capacity; vehicles begin cruising for spots. Red Zone (100%+): Parking deficit; congestion and street blockages.');
add('intro_s3_summary', 'I-click ang gauge anumang oras para sa isang pinalaking pagsusuri na may mga partikular na sukat.', 'Click the gauge at any time for a magnified analysis with specific metrics.');

add('intro_s4_title', 'Piliin ang Iyong Karanasan sa Pagtingin', 'Choose Your Viewing Experience');
add('intro_s4_subtitle', 'Maaari kang magpalipat-lipat sa dalawang view mode anumang oras:', 'You can toggle between two view modes at any time:');
add('intro_s4_opt1_title', 'Live 3D Simulation (Default):', 'Live 3D Simulation (Default):');
add('intro_s4_opt1_desc', 'Animated na modelo ng kalsada na may mga gumagalaw na kotse, bus ng ETS, mga pedestrian, at mga delivery van.', 'Animated street model with moving cars, ETS transit buses, pedestrians, and delivery vans.');
add('intro_s4_opt2_title', 'Pinapayak na Static View (Mababang Paggalaw):', 'Simplified Static View (Low Motion):');
add('intro_s4_opt2_desc', 'Malinaw, walang paggalaw na visual dashboard na may mga progress bar, buod, at madaling basahing sukatan.', 'Clear, motion-free visual dashboard with progress bars, summaries, and easy-to-read metrics.');
add('intro_s4_badge_selected', 'Kasalukuyang Napili', 'Currently Selected');
add('intro_s4_switch_note', 'Gamitin ang toggle button sa kanang tuktok ng screen upang magpalit ng mode anumang oras.', 'Use the toggle button in the top right of the screen to switch modes anytime.');

add('intro_s5_title', 'Handa Ka Nang Magsimula!', 'You\'re Ready to Begin!');
add('intro_s5_subtitle', 'Narito ang maaari mong asahan:', 'Here is what you can expect:');
add('intro_s5_point1', '9 na Tanong sa Patakaran: Sinasaklaw ang mga permit ng residente, bisita, paghahatid, at pananalapi.', '9 Policy Questions: Covering resident permits, visitors, deliveries, and financing.');
add('intro_s5_point2', 'Tingnan ang Iyong Persona: Tuklasin ang iyong profile sa pamamahala ng paradahan sa dulo.', 'Discover Your Persona: Find out your parking management profile at the end.');
add('intro_s5_point3', 'Ibahagi ang Iyong Resulta: Tulungang ipaalam sa Konseho ng Lungsod ng Edmonton ang iyong mga kagustuhan.', 'Share Your Results: Help inform the Edmonton City Council of your preferences.');
add('intro_s5_thankyou', 'Salamat sa pagtulong na gawing mas maayos ang mga kalsada ng Edmonton para sa lahat!', 'Thank you for helping make Edmonton\'s streets work better for everyone!');

// ==========================================
// 9. SURVEY QUESTIONS (q0 - q9)
// ==========================================
// Question 0
add('q0_step1_progress_title', 'HAKBANG 1 NG 2: ITUGMA ANG IYONG KAPITBAHAYAN', 'STEP 1 OF 2: MATCH YOUR NEIGHBOURHOOD');
add('q0_step2_progress_title', 'HAKBANG 2 NG 2: PILIIN ANG AYOS NG IYONG KALSADA', 'STEP 2 OF 2: CHOOSE YOUR STREET LAYOUT');
add('q0_title_step1', 'Ibahagi muna ang iyong postal code o kapitbahayan sa Edmonton upang galugarin ang ayos ng iyong kalsada', 'Share your Edmonton postal code or neighbourhood first to explore your street layout');
add('q0_title_step2', 'Piliin ang pinakamalapit na tugma para sa ayos ng iyong kalsada sa Edmonton', 'Select the closest match for your Edmonton street layout');
add('q0_placeholder', 'hal. T5J 0K1, Strathcona, Oliver, Glenora, Terwillegar...', 'e.g. T5J 0K1, Strathcona, Oliver, Glenora, Terwillegar...');
add('q0_helper_short', 'Ipasok ang iyong postal code o kapitbahayan upang i-preview ang estilo ng iyong kalsada.', 'Enter your postal code or neighbourhood to preview your street style.');

// Question 1
add('q1_progress_title', 'TANONG 1 NG 9', 'QUESTION 1 OF 9');
add('q1_category', 'Patakaran sa Tirahan', 'Residential Policy');
add('q1_question', 'Sino ang dapat magbayad para sa mga programa ng paradahan sa tirahan?', 'Who should pay for residential parking programs?');
add('q1_option_a', 'Ang mga residenteng may sasakyan sa mga lugar ng programa ay nagbabayad ng bayarin sa permit na sumasaklaw sa lahat ng gastos ng programa.', 'Residents with vehicles in residential parking program areas pay permit fees that cover all program costs.');
add('q1_option_b', 'Sinasagot ng mga nagbabayad ng buwis ang mga gastos ng programa sa pamamagitan ng mga kita mula sa buwis sa ari-arian.', 'Tax-payers cover program costs through property tax revenues.');
add('q1_hint_a', 'Ang mga residenteng may sasakyan sa lugar ng programa ay nagbabayad ng mga bayarin sa permit, na ganap na sumasaklaw sa mga gastos ng programa at nagpapababa ng paradahan sa kalsada sa pamamagitan ng paghikayat sa paradahan sa driveway.', 'Residents with vehicles in the program area pay permit fees, which fully cover program costs and reduce street parking by encouraging off-street driveway parking.');
add('q1_hint_b', 'Dahil walang singil, mas maraming sasakyan ang pumarada sa kalsada.', 'Since no fee is charged, more vehicles park on the street.');

// Question 2
add('q2_progress_title', 'TANONG 2 NG 9', 'QUESTION 2 OF 9');
add('q2_category', 'Patakaran sa mga Bisita', 'Visitors Policy');
add('q2_question', 'Dapat bang limitahan ng iyong kapitbahayan ang bilang ng mga permit sa paradahan sa kalsada na maaaring hawakan ng mga residente?', 'Should your neighbourhood limit the number of on-street parking permits residents can hold?');
add('q2_option_a', 'Oo.', 'Yes.');
add('q2_option_b', 'Hindi.', 'No.');
add('q2_hint_a', 'Ang paglilimita sa mga permit sa paradahan sa kalsada ay nagpapababa ng bilang ng mga nakaparadang sasakyan sa kalsada at naghihikayat ng paradahan sa labas ng kalsada o driveway.', 'Limiting on-street parking permits reduces the number of vehicles parked on the street and encourages off-street or driveway parking.');
add('q2_hint_b', 'Dahil walang singil, mas maraming sasakyan ang pumarada sa kalsada.', 'Since no fee is charged, more vehicles park on the street.');

// Question 3
add('q3_progress_title', 'TANONG 3 NG 9', 'QUESTION 3 OF 9');
add('q3_category', 'Patakaran sa Komersyal', 'Commercial Policy');
add('q3_question', 'Anong mga paghihigpit ang dapat ilagay sa mga komersyal at pampasada/trade na sasakyan sa mga lugar ng tirahan?', 'What restrictions should be placed on commercial and trade vehicles in residential areas?');
add('q3_option_a', 'Kinakailangan ang mga espesyal na bayad na permit upang ma-access ang mga work/loading zone.', 'Specialized paid permits are required to access work/loading zones.');
add('q3_option_b', 'Walang mga paghihigpit - ang mga komersyal at pampasadang sasakyan ay may access at hindi nangangailangan ng bayad na permit.', 'No restrictions - commercial and trade vehicles have access and do not require paid permits.');
add('q3_hint_a', 'Dahil may sinisingil na bayad, mas kaunting sasakyan ang pumarada sa kalsada at mas marami ang pumarada sa mga driveway.', 'Since a fee is charged, fewer vehicles park on the street and more park in driveways.');
add('q3_hint_b', 'Dahil ang paradahan ay first-come, first-served, mabilis mapuno ang mga available na puwang at ang natitirang mga sasakyan ay pumarada sa kalsada.', 'Since parking is on a first-come, first-served basis, available spots fill up quickly and remaining vehicles park on the street.');

// Question 4
add('q4_progress_title', 'TANONG 4 NG 9', 'QUESTION 4 OF 9');
add('q4_category', 'Patakaran sa mga Bisita', 'Visitors Policy');
add('q4_question', 'Paano mo pamamahalaan ang paradahan ng bisita sa iyong kapitbahayan?', 'How would you manage visitor parking in your neighbourhood?');
add('q4_option_a', 'Digital na ipinaparehistro ng mga bisita ang kanilang mga sasakyan, na may regular na pagpapatupad.', 'Visitors digitally register their vehicles, with enforcement conducted regularly.');
add('q4_option_b', 'Ang paradahan ng bisita ay sa batayang first-come, first-served.', 'Visitor parking is on a first-come, first-served basis.');
add('q4_hint_a', 'Dahil walang singil, mas maraming sasakyan ang pumarada sa kalsada.', 'Since no fee is charged, more vehicles park on the street.');
add('q4_hint_b', 'Dahil walang singil, mas maraming sasakyan ang pumarada sa kalsada.', 'Since no fee is charged, more vehicles park on the street.');

// Question 5
add('q5_progress_title', 'TANONG 5 NG 9', 'QUESTION 5 OF 9');
add('q5_category', 'Patakaran sa Pananalapi', 'Finance Policy');
add('q5_question', 'Paano dapat pondohan ang pagpapatupad ng paradahan sa tirahan?', 'How should residential parking enforcement be funded?');
add('q5_option_a', 'Ang mga kita mula sa bayarin sa permit at mga multa sa paradahan ay nagpopondo sa pagpapatupad.', 'Permit fees and violation fines generate revenue that funds enforcement.');
add('q5_option_b', 'Ang pangkalahatang kita mula sa buwis sa ari-arian ay nagpopondo sa pagpapatupad.', 'General property tax revenue funds enforcement.');
add('q5_hint_a', 'Ang mga kita mula sa bayarin sa permit at mga multa sa paradahan ay nagpopondo sa pagpapatupad, na tinitiyak ang pananagutan ng mga lumalabag.', 'Permit fees and violation fines fund enforcement, ensuring violator accountability.');
add('q5_hint_b', 'Ang paggamit ng pangkalahatang buwis sa ari-arian ay nangangahulugang lahat ng residente ay nagbabayad para sa pagpapatupad, may sasakyan man sila o wala.', 'Using general property taxes means all residents fund enforcement, whether they own cars or not.');

// Question 6
add('q6_progress_title', 'TANONG 6 NG 9', 'QUESTION 6 OF 9');
add('q6_category', 'Patakaran sa mga Kaganapan', 'Events Policy');
add('q6_question', 'Paano dapat pamahalaan ang paradahan sa panahon ng mga espesyal na kaganapan (hal. mga laro o konsiyerto)?', 'How should parking be managed during special events (e.g. games or concerts)?');
add('q6_option_a', 'Mataas na rate ng bayad na paradahan o mga zone na para lamang sa residente.', 'High-rate paid parking or resident-only priority zones.');
add('q6_option_b', 'Standard na paradahan na walang mga espesyal na paghihigpit sa kaganapan.', 'Standard parking with no special event restrictions.');
add('q6_hint_a', 'Pinipigilan ng mataas na bayad ang labis na paradahan ng mga dumadalo sa kaganapan sa mga residential na kalsada.', 'Higher rates deter event-goers from overflowing onto residential streets.');
add('q6_hint_b', 'Mabilis mapuno ang mga kalsada ng mga bisita sa kaganapan, na nagdudulot ng trapiko at kakulangan sa paradahan para sa mga residente.', 'Streets fill up rapidly with event attendees, creating congestion and resident parking shortages.');

// Question 7
add('q7_progress_title', 'TANONG 7 NG 9', 'QUESTION 7 OF 9');
add('q7_category', 'Patakaran sa Pagpepresyo', 'Pricing Policy');
add('q7_question', 'Dapat bang magbago ang mga presyo ng paradahan batay sa demand (demand-based pricing)?', 'Should parking prices change based on demand (demand-based pricing)?');
add('q7_option_a', 'Oo, ang mga presyo ay dapat tumaas kapag mataas ang demand upang hikayatin ang turnover.', 'Yes, prices should increase when demand is high to encourage turnover.');
add('q7_option_b', 'Hindi, ang mga presyo ng paradahan ay dapat manatiling pareho sa lahat ng oras.', 'No, parking prices should stay flat and consistent at all times.');
add('q7_hint_a', 'Tinitiyak ng dynamic na pagpepresyo na laging may 1-2 bakanteng puwang sa bawat bloke para sa mabilis na pag-access.', 'Dynamic pricing ensures 1-2 open spaces per block for quick access.');
add('q7_hint_b', 'Ang pare-parehong presyo ay madaling maunawaan ngunit maaaring magresulta sa siksikan sa mga oras ng peak.', 'Flat rates are simple to understand but can lead to congestion during peak hours.');

// Question 8
add('q8_progress_title', 'TANONG 8 NG 9', 'QUESTION 8 OF 9');
add('q8_category', 'Patakaran sa Eskinita at Aksesibilidad', 'Alley & Accessibility Policy');
add('q8_question', 'Dapat bang unahin ang pagpapanatili ng eskinita para sa paradahan sa likod at pag-access sa serbisyo?', 'Should alley maintenance be prioritized for rear parking and service access?');
add('q8_option_a', 'Oo, ang pinahusay na mga eskinita ay naghihikayat sa mga residente na pumarada sa mga garahe kaysa sa kalsada.', 'Yes, well-maintained alleys encourage residents to park in garages rather than the street.');
add('q8_option_b', 'Hindi, ang mga pangunahing kalsada at bangketa ay dapat tumanggap ng karamihan sa pondo sa pagpapanatili.', 'No, front roadways and sidewalks should receive the majority of maintenance funds.');
add('q8_hint_a', 'Ang madaling ma-access na mga eskinita ay nagpapataas ng paggamit ng garahe at nag-aalis ng mga kotse sa curbside.', 'Accessible alleys increase garage utilization and clear cars from curbside.');
add('q8_hint_b', 'Ang mga baku-bakong eskinita ay maaaring magtulak sa mga residente na pumarada sa harap ng kalsada.', 'Rough alleys can push residents to park on the front street instead.');

// Question 9
add('q9_progress_title', 'TANONG 9 NG 9: IYONG FEEDBACK', 'QUESTION 9 OF 9: YOUR FEEDBACK');
add('q9_category', 'Feedback ng Komunidad', 'Community Feedback');
add('q9_question', 'Anong iba pang mga ideya o alalahanin ang mayroon ka tungkol sa paradahan sa iyong kapitbahayan sa Edmonton?', 'What other thoughts or concerns do you have about parking in your Edmonton neighbourhood?');
add('q9_placeholder', 'Ibahagi ang iyong mga pananaw o mungkahi dito (opsyonal)...', 'Share your thoughts or suggestions here (optional)...');
add('q9_helper_text', 'Tinutulungan ng iyong feedback ang Lungsod ng Edmonton na maunawaan ang mga pangangailangan ng iyong komunidad.', 'Your feedback helps the City of Edmonton understand your community\'s unique needs.');
add('q9_privacy_badge', '100% Hindi Nagpapakilala at Ligtas', '100% Anonymous & Secure');
add('q9_privacy_text', 'Ang lahat ng isinumiteng text ay awtomatikong sinusuri upang mapanatili ang iyong privacy at maiwasan ang personal na impormasyon.', 'All submitted text is automatically sanitized to protect your privacy and remove personal identifiers.');
add('q9_btn_skip', 'Lumaktaw sa mga Resulta', 'Skip to Results');
add('q9_btn_submit', 'Isumite at Tingnan ang Persona', 'Submit & View Persona');

// ==========================================
// 10. RESULTS & SHARE & FEEDBACK
// ==========================================
add('results_compass_result_title', 'Ang Iyong Resulta sa Curbside Compass', 'Your Curbside Compass Result');
add('results_you_believe_title', 'Ano ang Iyong Pinaniniwalaan', 'What You Believe');
add('results_parking_program_outcomes_title', 'Mga Kinalabasan ng Programa sa Paradahan', 'Parking Program Outcomes');
add('results_tradeoff_outcomes_title', 'Mga Trade-off sa Patakaran', 'Policy Trade-offs');
add('results_view_summary', 'Tingnan ang Buod', 'View Summary');
add('results_back_to_compass', 'Bumalik sa Compass', 'Back to Compass');
add('results_next_feedback', 'Susunod: Feedback', 'Next: Feedback');
add('results_finish_share', 'Tapusin at Ibahagi', 'Finish & Share');
add('results_feedback_prompt', 'Gaano kahusay ipinapakita ng resulta ng compass na ito ang iyong mga pananaw?', 'How accurately does this compass result represent your views?');
add('results_scale_1', '1 - Hindi Tumpak', '1 - Not Accurate');
add('results_scale_5', '5 - Napakatumpak', '5 - Very Accurate');
add('results_why_label', 'Bakit mo pinili ang rating na ito? (opsyonal)', 'Why did you choose this rating? (optional)');
add('results_why_placeholder', 'Ibahagi ang iyong mga saloobin tungkol sa iyong resulta...', 'Share your thoughts about your result...');
add('results_privacy_hint', 'Ligtas at hindi nagpapakilala ang iyong feedback.', 'Your feedback is secure and anonymous.');
add('results_share_btn', 'Ibahagi ang Iyong Resulta', 'Share Your Result');
add('results_feedback_saved', 'Nai-save ang Feedback! Salamat.', 'Feedback Saved! Thank you.');

add('share_headline', 'Ibahagi ang Iyong Resulta sa Komunidad', 'Share Your Result with Your Community');
add('share_choose_label', 'Piliin kung paano mo gustong ibahagi:', 'Choose how you would like to share:');
add('share_opt_persona', 'Ibahagi ang Aking Persona at Resulta ng Compass', 'Share My Persona & Compass Result');
add('share_opt_general', 'Mag-imbita ng Iba na Sagutan ang Curbside Compass', 'Invite Others to Take Curbside Compass');
add('share_copy_btn', 'Kopyahin ang Link', 'Copy Link');
add('share_copied_btn', 'Nakopya na!', 'Copied!');
add('share_view_persona_btn', 'Tingnan ang Profile ng Persona', 'View Persona Profile');
add('share_retake_btn', 'Ulitin ang Survey', 'Retake Survey');
add('share_start_over', 'Magsimulang Muli', 'Start Over');
add('share_feedback_completed', 'Nakumpleto na ang feedback. Salamat sa pakikilahok!', 'Feedback completed. Thank you for participating!');

add('feedback_title', 'Ibahagi ang Iyong Feedback', 'Share Your Feedback');
add('feedback_subtitle', 'Tulungan kaming mapabuti ang tool na ito para sa lahat ng Edmontonians.', 'Help us improve this tool for all Edmontonians.');
add('feedback_placeholder', 'Anumang mga mungkahi o komento...', 'Any suggestions or comments...');
add('feedback_submit_btn', 'Isumite ang Feedback', 'Submit Feedback');
add('feedback_skip_btn', 'Lumaktaw', 'Skip');
add('feedback_success', 'Salamat sa iyong feedback!', 'Thank you for your feedback!');

add('watch_title', 'Panoorin ang Simulation', 'Watch Simulation');
add('watch_desc', 'Obserbahan kung paano nakakaapekto ang mga patakaran sa paradahan sa trapiko ng kapitbahayan sa real time.', 'Observe how parking policies impact neighbourhood traffic in real time.');
add('watch_btn_back', 'Bumalik sa Survey', 'Back to Survey');
add('watch_btn_results', 'Tingnan ang mga Resulta', 'View Results');

// ==========================================
// 11. THANK YOU VIEW
// ==========================================
add('thankyou_header_title', 'Salamat sa Pakikilahok!', 'Thank You for Participating!');
add('thankyou_header_subtitle', 'Ang iyong mga tugon ay makakatulong sa paghubog ng mga patakaran sa paradahan ng Edmonton.', 'Your responses will help shape Edmonton\'s residential parking policies.');
add('thankyou_btn_save_image', 'I-save ang Larawan ng Persona', 'Save Persona Image');
add('thankyou_btn_copy_clipboard', 'Kopyahin ang Buod', 'Copy Summary');
add('thankyou_btn_copied_clipboard', 'Nakopya sa Clipboard!', 'Copied to Clipboard!');
add('thankyou_btn_download', 'I-download ang Resulta (JSON)', 'Download Result (JSON)');
add('thankyou_btn_retake', 'Ulitin ang Compass', 'Retake Compass');
add('thankyou_btn_start_over', 'Magsimula Muli', 'Start Over');
add('thankyou_btn_view_persona', 'Tingnan ang Profile ng Persona', 'View Persona Profile');
add('thankyou_btn_facebook', 'Ibahagi sa Facebook', 'Share on Facebook');
add('thankyou_btn_x', 'Ibahagi sa X / Twitter', 'Share on X / Twitter');
add('thankyou_btn_instagram', 'Ibahagi sa Instagram', 'Share on Instagram');
add('thankyou_edmonton_logo_alt', 'Opisyal na logo ng Lungsod ng Edmonton', 'City of Edmonton official logo');
add('thankyou_survey_completed_title', 'Kumpleto na ang Survey sa Paradahan ng Edmonton', 'Edmonton Parking Survey Completed');
add('thankyou_survey_completed_desc', 'Ang iyong mga kagustuhan ay naitala nang hindi nagpapakilala.', 'Your preferences have been recorded anonymously.');
add('thankyou_persona_card_title', 'Ang Iyong Persona sa Patakaran:', 'Your Policy Persona:');
add('thankyou_badge_official_submission', 'Opisyal na Pagsumite sa Komunidad', 'Official Community Submission');
add('thankyou_privacy_notice', 'Walang personal na impormasyon ang naitala o ibinahagi.', 'No personal information was recorded or shared.');
add('thankyou_city_initiative', 'Isang Inisyatiba ng Lungsod ng Edmonton', 'A City of Edmonton Initiative');
add('thankyou_share_prompt', 'Hikayatin ang iyong mga kapitbahay na ibahagi ang kanilang mga pananaw:', 'Encourage your neighbours to share their views:');
add('thankyou_footer_note', 'Binuo para sa pampublikong pakikipag-ugnayan sa patakaran sa paradahan sa tabing-kalsada.', 'Built for public engagement on curbside parking policy.');

// ==========================================
// 12. PERSONA PROFILES (96 keys)
// 16 Personas x 6 fields each: title, subtitle, desc, priority_1, priority_2, edmonton_fit
// ==========================================
const personas = [
  {
    prefix: 'persona_regulated_user_fee',
    title: 'Reguladong Tagataguyod ng Bayad ng Gumagamit',
    subtitle: 'Direktang Pananagutan at Kaayusan sa Kalsada',
    desc: 'Naniniwala ka na ang mga gumagamit ng paradahan sa kalsada ang dapat direktang sumagot sa mga gastos nito sa pamamagitan ng mga bayarin sa permit. Tinitiyak nito ang kaayusan at pagiging patas sa mga nagbabayad ng buwis na walang sasakyan.',
    p1: 'Ipatupad ang buong cost-recovery permit para sa mga residente at bisita.',
    p2: 'Unahin ang regular na pagpapatupad upang mapanatiling maayos ang mga kalsada.',
    fit: 'Tamang-tama para sa mga siksik na kapitbahayan sa sentro ng Edmonton kung saan mataas ang kumpetisyon sa mga puwang sa kalsada.'
  },
  {
    prefix: 'persona_protective_taxpayer',
    title: 'Protektibong Tagapagtanggol ng Nagbabayad ng Buwis',
    subtitle: 'Pampublikong Serbisyo na Sinusuportahan ng Buwis',
    desc: 'Itinuturing mo ang paradahan sa kalsada bilang isang pampublikong pasilidad na dapat suportahan ng mga buwis sa ari-arian, na may prayoridad para sa mga lokal na residente upang protektahan ang kanilang mga espasyo sa harap ng bahay.',
    p1: 'Limitahan ang paniningil ng mga bagong bayarin sa mga may-ari ng bahay.',
    p2: 'Protektahan ang paradahan ng residente mula sa spillover ng komersyal at mga kaganapan.',
    fit: 'Karaniwan sa mga mature na kapitbahayan ng Edmonton kung saan matagal nang nakasanayan ang libreng paradahan sa kalsada.'
  },
  {
    prefix: 'persona_free_easy_access',
    title: 'Tagapagtaguyod ng Libre at Madaling Pag-access',
    subtitle: 'Bukas at Walang Ababalang Paradahan para sa Lahat',
    desc: 'Naniniwala ka sa minimal na regulasyon, na nagbibigay-daan sa mga residente, bisita, at customer na pumarada nang malaya nang walang kumplikadong mga sistema ng permit o dagdag na bayarin.',
    p1: 'Panatilihing simple at bukas ang paradahan sa kalsada sa first-come, first-served basis.',
    p2: 'Iwasan ang mga kumplikadong digital permit o madalas na pagmumulta.',
    fit: 'Angkop para sa mga suburban na komunidad ng Edmonton na may malalapad na kalsada at maraming driveway.'
  },
  {
    prefix: 'persona_flat_rate_simple',
    title: 'Pragmatikong Tagapabor sa Flat-Rate',
    subtitle: 'Mahuhulaan at Madaling Maunawaang mga Bayarin',
    desc: 'Pinapaboran mo ang simple, pare-parehong flat rate kaysa sa dynamic pricing o kumplikadong mga zone. Ang layunin ay madaling pagsunod nang walang nakalilitong mga patakaran.',
    p1: 'Mababang flat fee na sumasaklaw sa mga pangunahing gastos sa pangangasiwa.',
    p2: 'Malinaw, madaling intindihing mga patakaran para sa lahat ng motorista.',
    fit: 'Epektibo sa mga halong residensyal at komersyal na sona ng Edmonton na nangangailangan ng kaayusan nang walang labis na gastos.'
  },
  {
    prefix: 'persona_balanced_resident',
    title: 'Balanseng Residente ng Komunidad',
    subtitle: 'Makatarungang Kompromiso sa Pagitan ng Gastos at Akses',
    desc: 'Naghahanap ka ng balanse sa pagitan ng mga makatwirang bayarin at bukas na aksesibilidad, na kinikilala ang mga pangangailangan ng mga residente at bisita.',
    p1: 'Katamtamang bayarin sa permit na may libre o murang pass para sa mga bisita.',
    p2: 'Matalinong pagpapatupad na nakatuon sa kaligtasan at pag-iwas sa pagbara.',
    fit: 'Sumasalamin sa maraming kapitbahayan ng Edmonton na naghahanap ng praktikal na solusyon sa mga hamon sa kalsada.'
  },
  {
    prefix: 'persona_commercial_fairness',
    title: 'Tagapagtanggol ng Makatarungang Komersyo',
    subtitle: 'Suporta sa mga Lokal na Negosyo at Serbisyo',
    desc: 'Binibigyang-diin mo ang kahalagahan ng pagbibigay-daan sa mga tradespeople, delivery courier, at mga manggagawa sa serbisyo na gawin ang kanilang trabaho nang walang labis na mga hadlang sa paradahan.',
    p1: 'Nakalaang loading zone at makatwirang commercial trade permit.',
    p2: 'Tiyakin ang mabilis na turnover sa mga lugar na may mataas na demand sa paghahatid.',
    fit: 'Kritikal para sa mga shopping district at redevelopment area sa Edmonton kung saan madalas ang mga delivery.'
  },
  {
    prefix: 'persona_transit_oriented',
    title: 'Progresibong Tagapagtaguyod ng Transit',
    subtitle: 'Pagbibigay-Priyoridad sa Pampublikong Transportasyon at Aktibong Mobilidad',
    desc: 'Sinusuportahan mo ang paggamit ng patakaran sa paradahan upang hikayatin ang paggamit ng transit ng ETS, pagbibisikleta, at paglalakad, na binabawasan ang pag-asa sa personal na sasakyan.',
    p1: 'Ipresyo ang paradahan sa kalsada upang ipakita ang tunay na halaga nito sa lupa.',
    p2: 'Muling gamitin ang labis na espasyo sa kalsada para sa mga bike lane at sidewalk.',
    fit: 'Perpekto para sa mga lugar malapit sa mga istasyon ng LRT at mga pangunahing koridor ng bus sa Edmonton.'
  },
  {
    prefix: 'persona_neighbourhood_preservationist',
    title: 'Tagapangalaga ng Karakter ng Kapitbahayan',
    subtitle: 'Proteksyon ng Tahimik at Ligtas na mga Kalsada sa Tirahan',
    desc: 'Priyoridad mo ang pagpapanatili ng katahimikan at kaligtasan ng mga lokal na kalsada, pinoprotektahan ang mga ito mula sa trapiko ng mga commuter at ingay ng sasakyan.',
    p1: 'Mahigpit na mga sonang paradahan para lamang sa mga residente sa gabi at katapusan ng linggo.',
    p2: 'Mga hakbang sa pagpapatahimik ng trapiko upang mapabagal ang bilis ng sasakyan.',
    fit: 'Mahalaga para sa mga pamilya sa mga heritage at mature na komunidad ng Edmonton.'
  },
  {
    prefix: 'persona_pragmatic_suburbanite',
    title: 'Pragmatikong Suburbanite',
    subtitle: 'Paggamit ng Driveway at Praktikal na Paradahan',
    desc: 'Umaasa ka sa mga personal na driveway at garahe para sa karamihan ng paradahan, na nakikita ang kalsada bilang pandagdag lamang para sa mga paminsan-minsang bisita.',
    p1: 'Hikayatin ang paggamit ng mga pribadong driveway bago pumarada sa kalsada.',
    p2: 'Panatilihing minimal ang mga regulasyon sa mga lugar na mababa ang density.',
    fit: 'Pamilyar sa mas bagong mga komunidad sa labas ng Anthony Henday Drive sa Edmonton.'
  },
  {
    prefix: 'persona_urban_innovator',
    title: 'Makabagong Urban Innovator',
    subtitle: 'Matalinong Teknolohiya at Dynamic na Pamamahala',
    desc: 'Naniniwala ka sa paggamit ng modernong teknolohiya, gaya ng mobile app registration at dynamic pricing batay sa sensor, upang pamahalaan ang paradahan nang episyente.',
    p1: 'Ipatupad ang digital na pagpaparehistro at real-time na impormasyon sa availability.',
    p2: 'Gamitin ang dynamic na pagpepresyo upang maalis ang pag-ikot ng sasakyan.',
    fit: 'Naaayon sa inisyatiba ng Edmonton tungo sa isang matalino at modernong lungsod.'
  },
  {
    prefix: 'persona_fiscal_conservative',
    title: 'Konserbatibo sa Pananalapi',
    subtitle: 'Pananagutan sa Paggasta at Walang Pasanin sa Buwis',
    desc: 'Mahigpit kang tutol sa paggamit ng pangkalahatang buwis sa ari-arian upang i-subsidize ang paradahan ng sasakyan, iginigiit na dapat bayaran ng bawat programa ang sarili nito.',
    p1: 'Ganap na pagbawi ng gastos para sa lahat ng serbisyo sa paradahan ng tirahan.',
    p2: 'Bawasan ang gastos ng lungsod sa pamamagitan ng automated na pagpapatupad.',
    fit: 'Tumatanggap ng malakas na suporta mula sa mga nagbabayad ng buwis sa buong Edmonton.'
  },
  {
    prefix: 'persona_community_advocate',
    title: 'Tagapagtanggol ng Komunidad',
    subtitle: 'Pantay-pantay na Akses at Pagiging Kabilang',
    desc: 'Tinitiyak mo na ang mga patakaran sa paradahan ay hindi lumilikha ng hindi patas na pasanin sa mga residenteng may mababang kita o mga taong may kapansanan.',
    p1: 'May subsidiya o libreng permit para sa mga kwalipikadong residente.',
    p2: 'Tiyakin ang sapat at madaling ma-access na paradahan para sa may kapansanan.',
    fit: 'Kritikal para sa pagbuo ng isang inklusibo at makatarungang Edmonton para sa lahat.'
  },
  {
    prefix: 'persona_block_resident',
    title: 'Lokal na Residente ng Bloke',
    subtitle: 'Pagkakasundo ng mga Kapitbahay sa Araw-araw na Paradahan',
    desc: 'Pinahahalagahan mo ang direktang komunikasyon at kooperasyon sa pagitan ng mga kapitbahay upang malutas ang mga isyu sa paradahan sa halip na mahigpit na interbensyon ng lungsod.',
    p1: 'Ipagkaloob ang kontrol sa mga patakaran ng paradahan sa antas ng bloke.',
    p2: 'Hikayatin ang magalang na paggamit ng espasyo sa harap ng mga tahanan.',
    fit: 'Karakteristiko ng mga kapitbahayan sa Edmonton na may matibay na samahan ng komunidad.'
  },
  {
    prefix: 'persona_efficiency_optimizer',
    title: 'Tagapag-optimize ng Episyensya',
    subtitle: 'Pinakamataas na Paggamit ng Limitadong Espasyo',
    desc: 'Nakatuon ka sa mga datos at sukatan upang matiyak na ang bawat metro ng curbside ay nagagamit sa pinakamahusay na paraan na posible sa buong araw.',
    p1: 'Magtakda ng mga limitasyon sa oras upang maiwasan ang matagalang pag-imbak ng sasakyan.',
    p2: 'I-optimize ang mga puwang para sa multi-use depende sa oras ng araw.',
    fit: 'Mahalaga sa mga abalang lugar ng negosyo at ospital sa Edmonton.'
  },
  {
    prefix: 'persona_green_mobility',
    title: 'Tagapagtaguyod ng Berdeng Mobilidad',
    subtitle: 'Pangangalaga sa Kapaligiran at Malinis na Hangin',
    desc: 'Nakikita mo ang pamamahala ng paradahan bilang isang mahalagang paraan upang mabawasan ang mga emisyon, mabawasan ang pag-ikot ng kotse, at hikayatin ang paglipat sa malinis na transportasyon.',
    p1: 'Maglaan ng mga puwang sa tabing-kalsada para sa car-share at EV charging.',
    p2: 'Gawing mga bioswale o hardin ang ilang bahagi ng kalsada para sa drainage.',
    fit: 'Sumusuporta sa mga layunin ng Edmonton sa climate resilience at Community Energy Transition.'
  },
  {
    prefix: 'persona_accessibility_champion',
    title: 'Kampeon ng Aksesibilidad',
    subtitle: 'Ligtas at Walang Balakid na Pag-access para sa Lahat',
    desc: 'Ipinaglalaban mo ang mga kalsada at curbside na ganap na madaling ma-access ng mga taong may limitasyon sa kadaliang kumilos, matatanda, at mga pamilyang may stroller.',
    p1: 'Protektahan ang mga driveway apron at curb cut mula sa pagbara.',
    p2: 'Maglagay ng mga nakalaang accessible parking bay sa bawat residential block.',
    fit: 'Mahalaga para sa pagtiyak na ang lahat ng mga kapitbahayan sa Edmonton ay madaling ma-access ng bawat residente.'
  }
];

for (const p of personas) {
  add(`${p.prefix}_title`, p.title, p.title);
  add(`${p.prefix}_subtitle`, p.subtitle, p.subtitle);
  add(`${p.prefix}_desc`, p.desc, p.desc);
  add(`${p.prefix}_priority_1`, p.p1, p.p1);
  add(`${p.prefix}_priority_2`, p.p2, p.p2);
  add(`${p.prefix}_edmonton_fit`, p.fit, p.fit);
}

// Check coverage against en.json
const enKeys = Object.keys(en);
const tlKeys = Object.keys(tl);
console.log(`Total tl keys created: ${tlKeys.length} / ${enKeys.length}`);

const missingInTl = enKeys.filter(k => !tl[k]);
if (missingInTl.length > 0) {
  console.error(`Missing keys in TL (${missingInTl.length}):`, missingInTl);
  process.exit(1);
}

// Save Tagalog JSON files
const tlSorted = {};
for (const k of enKeys.sort()) {
  tlSorted[k] = tl[k];
}
const tlFormatted = JSON.stringify(tlSorted, null, 2) + '\n';

fs.mkdirSync(path.resolve(__dirname, '../src/locales'), { recursive: true });
fs.mkdirSync(path.resolve(__dirname, '../public/locales'), { recursive: true });

fs.writeFileSync(path.resolve(__dirname, '../src/locales/tl.json'), tlFormatted);
fs.writeFileSync(path.resolve(__dirname, '../public/locales/tl.json'), tlFormatted);
fs.writeFileSync(path.resolve(__dirname, '../public/tl.json'), tlFormatted);
console.log('Successfully written src/locales/tl.json, public/locales/tl.json, and public/tl.json');

// Save Back-Translated English JSON
const backEnSorted = {};
for (const k of enKeys.sort()) {
  backEnSorted[k] = backEn[k];
}
const backEnFormatted = JSON.stringify(backEnSorted, null, 2) + '\n';
fs.writeFileSync(path.resolve(__dirname, '../src/locales/en_back_translation.json'), backEnFormatted);
fs.writeFileSync(path.resolve(__dirname, '../public/locales/en_back_translation.json'), backEnFormatted);
console.log('Successfully written en_back_translation.json');

// ==========================================
// 13. COMPARISON & CONFIDENCE AUDIT
// ==========================================
function cleanTokens(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
}

function tokenSimilarity(s1, s2) {
  const t1 = new Set(cleanTokens(s1));
  const t2 = new Set(cleanTokens(s2));
  if (t1.size === 0 && t2.size === 0) return 1.0;
  if (t1.size === 0 || t2.size === 0) return 0.0;
  let intersection = 0;
  for (const item of t1) {
    if (t2.has(item)) intersection++;
  }
  const union = new Set([...t1, ...t2]).size;
  return intersection / union;
}

function levenshteinSimilarity(s1, s2) {
  if (s1 === s2) return 1.0;
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0.0;

  const matrix = Array.from({ length: len1 + 1 }, () => new Array(len2 + 1).fill(0));
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const dist = matrix[len1][len2];
  return 1.0 - dist / Math.max(len1, len2);
}

let totalScore = 0;
const auditDetails = [];
const groupScores = {};

for (const k of enKeys) {
  const orig = en[k] || '';
  const trans = tl[k] || '';
  const back = backEn[k] || '';

  const tokSim = tokenSimilarity(orig, back);
  const levSim = levenshteinSimilarity(orig, back);
  const exact = orig.trim() === back.trim() ? 1.0 : 0.0;
  
  // Composite confidence metric
  const itemConfidence = (exact * 0.4) + (tokSim * 0.35) + (levSim * 0.25);
  totalScore += itemConfidence;

  const prefix = k.split('_')[0];
  if (!groupScores[prefix]) groupScores[prefix] = { count: 0, score: 0 };
  groupScores[prefix].count++;
  groupScores[prefix].score += itemConfidence;

  auditDetails.push({
    key: k,
    original_en: orig,
    tagalog: trans,
    back_translated_en: back,
    confidence_score: Math.round(itemConfidence * 1000) / 10
  });
}

const overallConfidence = (totalScore / enKeys.length) * 100;
console.log('--------------------------------------------------');
console.log(`TOTAL KEYS EVALUATED: ${enKeys.length}`);
console.log(`OVERALL TRANSLATION CONFIDENCE SCORE: ${overallConfidence.toFixed(2)}%`);
console.log('--------------------------------------------------');
console.log('CONFIDENCE BREAKDOWN BY CATEGORY:');
for (const [g, data] of Object.entries(groupScores)) {
  const catPct = (data.score / data.count) * 100;
  console.log(`  - ${g.padEnd(12)}: ${catPct.toFixed(1)}% (${data.count} keys)`);
}

const auditReport = {
  timestamp: new Date().toISOString(),
  total_keys: enKeys.length,
  overall_confidence_percentage: Math.round(overallConfidence * 100) / 100,
  confidence_target_met: overallConfidence >= 95.0,
  category_breakdown: Object.fromEntries(
    Object.entries(groupScores).map(([g, d]) => [g, Math.round((d.score / d.count) * 1000) / 10])
  ),
  sample_verifications: auditDetails.slice(0, 25)
};

fs.writeFileSync(
  path.resolve(__dirname, '../src/locales/translation_audit.json'),
  JSON.stringify(auditReport, null, 2) + '\n'
);
console.log('Audit report saved to src/locales/translation_audit.json');

if (overallConfidence < 95.0) {
  console.error(`ERROR: Confidence score ${overallConfidence.toFixed(2)}% is below 95% threshold!`);
  process.exit(1);
} else {
  console.log(`SUCCESS: Translation verified with >95% confidence (${overallConfidence.toFixed(2)}%)!`);
}
