<div class="dates-box">
	<div class="meta-options tp_field components-base-control">
		<div class="components-base-control__field">
			<label class="components-base-control__label" for="tp_start"><?php echo __("Start", "wordpress-hsforms"); ?></label>
			<input id="tp_start" class="components-text-control__input" type="date" name="tp_start" value="<?php echo esc_attr( get_post_meta( get_the_ID(), 'tp_start', true ) ); ?>">
		</div>
	</div>
    <div class="meta-options tp_field components-base-control">
		<div class="components-base-control__field">
			<label class="components-base-control__label" for="tp_end"><?php echo __("End", "wordpress-hsforms"); ?></label>
			<input id="tp_end" class="components-text-control__input" type="date" name="tp_end" value="<?php echo esc_attr( get_post_meta( get_the_ID(), 'tp_end', true ) ); ?>">
		</div>
	</div>
</div>
