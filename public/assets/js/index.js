$('.l-date--event').on('mouseenter', function(){
  var EventTip = $('<span class="eventTip" />');
  var EventDescribe = $(this).attr('data-event');
  EventTip.html(EventDescribe);
  $(this).append(EventTip);
});

$('.l-date--event').on('mouseleave', function(){
  $('.eventTip').remove();
});