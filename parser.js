var cheerio = require('cheerio');
var __ = require('underscore');

var time_in_seconds = {
	minute: 60,
	hour: 3600,
	day: 86400,
	week: 604800,
	month: 2419200,
	year: 29030400
};

var defaults = {
	link: '',
	topic_title: '',
	reply_author: '',
	time: '',
	time_string: '',
	order: ''
};

var exports = module.exports = {};

exports.parse_html = function(html, profile) {

	var result = [];

	var $ = cheerio.load(html);

	// Topics that contain "Most recent reply"
	$('.bbp-topic-freshness').filter(function(index) {
		var item = {};

		// get content from parent
		var parent = $(this).closest('ul');
		if (!parent.length) {
			return false;
		}

		var topic = $(parent).find('.bbp-topic-title');
		var reply_author_link = $(this).find('.bbp-author-name');
		if (!topic.length || !reply_author_link.length) {
			return false;
		}

		// remove query parameters and hash
		var reply_author = reply_author_link.attr('href').split(/[?#]/)[0];
		// strip trailing slash
		reply_author = reply_author.replace(/\/$/g, '');
		// get last part of href
		reply_author = reply_author.substring(reply_author.lastIndexOf('/') + 1);

		// Check if the profile is not the last reply author.
		if (reply_author === profile) {
			return;
		}

		var title = topic.find('.bbp-topic-permalink');
		if (!title.length) {
			return false;
		}

		// String with text nodes only.
		var topic_title = $(title).contents().filter(function() {
			return this.nodeType === 3; //Node.TEXT_NODE
		}).text().replace(/[\t\r\n]+/g, "").trim();

		item['reply_author'] = reply_author.trim();
		item['topic_title'] = topic_title.trim();
		item['link'] = $.html(title);

		// Get time string.
		var text = $(this).find('a').first().text();
		item['time_string'] = text;

		// Split time string at the first ' ago'.
		var parts = text.split(' ago');

		// Split time string at comma's
		parts = parts[0].split(', ');

		// Trim the time strings
		parts = __.map(parts, function(val) {
			return val.trim();
		});

		// Calculate time in seconds
		var time = 0;
		__.each(parts, function(val) {
			var number = Number(val.replace(/[^\d]+/gi, ''));
			var type = __.find(__.keys(time_in_seconds), function(date_type) {
				return val.indexOf(date_type) !== -1;
			});

			time += time_in_seconds[type] * number;
		});

		item['time'] = time;

		item = __.defaults(item, defaults);

		result.push(item);
	});

	return result;
};


exports.order_items = function(results) {

	if (__.isEmpty(results)) {
		return [];
	}

	results = __.flatten(results);

	// Add order value.
	__.each(results, function(item, index) {
		item['order'] = item['time'] + index;
	});

	//Order results
	results = __.sortBy(results, function(item) {
		return item.order;
	});

	return results;
};