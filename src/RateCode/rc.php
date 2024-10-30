<div class="ratecodes-box">
	<div class="meta-options tp_field components-base-control">
		<div class="components-base-control__field">
			<label class="components-base-control__label" for="ratecode"><?php echo __("RateCode", "wordpress-hsforms"); ?></label>
			<input id="ratecode" class="components-text-control__input" type="text" name="ratecode" value="<?php echo esc_attr( get_post_meta( get_the_ID(), 'ratecode', true ) ); ?>">
		</div>
	</div>
</div>
