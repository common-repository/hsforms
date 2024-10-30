<div class="segment-box">
	<div class="meta-options tp_field components-base-control">
		<div class="components-base-control__field">
			<label class="components-base-control__label" for="code"><?php echo __("Segment Code", "wordpress-hsforms"); ?></label>
			<input id="code" class="components-text-control__input" type="text" name="code" value="<?php echo esc_attr( get_post_meta( get_the_ID(), 'code', true ) ); ?>">
		</div>
	</div>
</div>
